from fastapi import APIRouter, HTTPException
from database import execute_query, get_connection
from schemas import OrderCreate, StatusUpdate

router = APIRouter()

@router.get("/buyer/{buyer_id}")
def get_orders_by_buyer(buyer_id: int):
    query = """
        SELECT O.OrderID, O.BuyerID, O.CropID, O.WarehouseID,
               O.Quantity, O.OrderDate, O.Status,
               C.CropName, C.PricePerKg,
               F.Name AS FarmerName, W.Location AS WarehouseLocation
        FROM Orders O
        JOIN Crop C ON O.CropID=C.CropID
        JOIN Farmer F ON C.FarmerID=F.FarmerID
        JOIN Warehouse W ON O.WarehouseID=W.WarehouseID
        WHERE O.BuyerID=%s ORDER BY O.OrderDate DESC
    """
    return execute_query(query, (buyer_id,))

@router.get("/farmer/{farmer_id}")
def get_orders_by_farmer(farmer_id: int):
    query = """
        SELECT O.OrderID, O.BuyerID, O.CropID, O.WarehouseID,
               O.Quantity, O.OrderDate, O.Status,
               C.CropName, C.PricePerKg, B.Name AS BuyerName
        FROM Orders O
        JOIN Crop C ON O.CropID=C.CropID
        JOIN Buyer B ON O.BuyerID=B.BuyerID
        WHERE C.FarmerID=%s ORDER BY O.OrderDate DESC
    """
    return execute_query(query, (farmer_id,))

@router.post("/place")
def place_order(order: OrderCreate):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
        
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()

        # Validate that the BuyerID exists in the Buyer table
        cursor.execute("SELECT BuyerID FROM Buyer WHERE BuyerID = %s", (order.BuyerID,))
        buyer = cursor.fetchone()
        if not buyer:
            conn.rollback()
            raise HTTPException(
                status_code=404,
                detail=f"Buyer ID {order.BuyerID} does not exist. Please log in with a valid Buyer ID that is registered in the system."
            )

        # Validate that the CropID exists
        cursor.execute("SELECT CropID FROM Crop WHERE CropID = %s", (order.CropID,))
        if not cursor.fetchone():
            conn.rollback()
            raise HTTPException(status_code=404, detail=f"Crop ID {order.CropID} does not exist.")

        # Manually generate next OrderID
        cursor.execute("SELECT COALESCE(MAX(OrderID), 300) + 1 AS next_id FROM Orders")
        next_id = cursor.fetchone()['next_id']

        # Check warehouse stock
        cursor.execute(
            "SELECT Quantity FROM WarehouseCrop WHERE WarehouseID = %s AND CropID = %s",
            (order.WarehouseID, order.CropID)
        )
        stock = cursor.fetchone()
        if not stock:
            conn.rollback()
            raise HTTPException(status_code=404, detail="Crop not found in the selected warehouse.")
        
        if stock['Quantity'] < order.Quantity:
            conn.rollback()
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock in warehouse. Available: {stock['Quantity']} kg, Requested: {order.Quantity} kg"
            )

        # Decrease stock in warehouse
        cursor.execute(
            "UPDATE WarehouseCrop SET Quantity = Quantity - %s WHERE WarehouseID = %s AND CropID = %s",
            (order.Quantity, order.WarehouseID, order.CropID)
        )

        query = """
            INSERT INTO Orders (OrderID, BuyerID, CropID, WarehouseID, Quantity, OrderDate, Status)
            VALUES (%s, %s, %s, %s, %s, CURDATE(), 'PLACED')
        """
        cursor.execute(query, (next_id, order.BuyerID, order.CropID, order.WarehouseID, order.Quantity))
        order_id = next_id
        conn.commit()
        return {"message": "Order placed", "OrderID": order_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/all")
def get_all_orders():
    query = """
        SELECT O.OrderID, O.BuyerID, O.CropID, O.WarehouseID,
               O.Quantity, O.OrderDate, O.Status,
               C.CropName, C.PricePerKg,
               B.Name AS BuyerName, B.City AS BuyerCity,
               F.Name AS FarmerName,
               W.Location AS WarehouseLocation,
               ROUND(O.Quantity * C.PricePerKg, 2) AS OrderValue
        FROM Orders O
        JOIN Crop C ON O.CropID = C.CropID
        JOIN Buyer B ON O.BuyerID = B.BuyerID
        JOIN Farmer F ON C.FarmerID = F.FarmerID
        JOIN Warehouse W ON O.WarehouseID = W.WarehouseID
        ORDER BY O.OrderDate DESC
    """
    return execute_query(query)

@router.put("/{order_id}/status")
def update_order_status(order_id: int, status_update: StatusUpdate):
    query = "UPDATE Orders SET Status = %s WHERE OrderID = %s"
    execute_query(query, (status_update.status, order_id), fetch=False)
    return {"message": "Order status updated", "OrderID": order_id, "status": status_update.status}
