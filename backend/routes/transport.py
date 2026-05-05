from fastapi import APIRouter, HTTPException
from database import execute_query, get_connection
from schemas import TransportCreate, StatusUpdate

router = APIRouter()

@router.get("/buyer/{buyer_id}")
def get_transport_by_buyer(buyer_id: int):
    query = """
        SELECT T.TransportID, T.VehicleNo, T.DriverName,
               T.Status AS TransportStatus,
               O.OrderID, O.BuyerID, O.CropID, O.WarehouseID,
               O.Quantity, O.OrderDate, O.Status AS OrderStatus,
               C.CropName, C.PricePerKg, W.Location AS WarehouseLocation
        FROM Orders O
        LEFT JOIN Transport T ON O.OrderID=T.OrderID
        JOIN Crop C ON O.CropID=C.CropID
        JOIN Warehouse W ON O.WarehouseID=W.WarehouseID
        WHERE O.BuyerID=%s ORDER BY O.OrderDate DESC
    """
    return execute_query(query, (buyer_id,))

@router.get("/unassigned")
def get_unassigned_transport():
    query = """
        SELECT O.OrderID, O.BuyerID, O.CropID, O.WarehouseID,
               O.Quantity, O.OrderDate, O.Status,
               C.CropName, B.Name AS BuyerName, B.City AS BuyerCity,
               W.Location AS WarehouseLocation
        FROM Orders O
        JOIN Crop C ON O.CropID = C.CropID
        JOIN Buyer B ON O.BuyerID = B.BuyerID
        JOIN Warehouse W ON O.WarehouseID = W.WarehouseID
        LEFT JOIN Transport T ON O.OrderID = T.OrderID
        WHERE O.Status IN ('PLACED', 'PAID') AND T.TransportID IS NULL
        ORDER BY O.OrderDate ASC
    """
    return execute_query(query)

@router.get("/all")
def get_all_transport():
    query = """
        SELECT T.TransportID, T.VehicleNo, T.DriverName,
               T.Status AS TransportStatus,
               O.OrderID, O.BuyerID, O.CropID, O.WarehouseID,
               O.Quantity, O.OrderDate, O.Status AS OrderStatus,
               C.CropName, B.Name AS BuyerName, B.City,
               W.Location AS WarehouseLocation
        FROM Transport T
        JOIN Orders O ON T.OrderID = O.OrderID
        JOIN Crop C ON O.CropID = C.CropID
        JOIN Buyer B ON O.BuyerID = B.BuyerID
        JOIN Warehouse W ON O.WarehouseID = W.WarehouseID
        ORDER BY O.OrderDate DESC
    """
    return execute_query(query)

@router.post("/assign")
def assign_transport(transport: TransportCreate):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
        
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        query1 = """
            INSERT INTO Transport (TransportID, OrderID, VehicleNo, DriverName, Status)
            VALUES (%s, %s, %s, %s, 'ASSIGNED')
        """
        cursor.execute(query1, (transport.TransportID, transport.OrderID, transport.VehicleNo, transport.DriverName))
        
        conn.commit()
        return {"message": "Driver assigned. Please mark as SHIPPED to start transit.", "TransportID": transport.TransportID}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.put("/{transport_id}/ship")
def ship_transport(transport_id: int):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
        
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cursor.execute("SELECT OrderID FROM Transport WHERE TransportID = %s", (transport_id,))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Transport not found")
        order_id = result['OrderID']
        
        cursor.execute("UPDATE Transport SET Status = 'IN_TRANSIT' WHERE TransportID = %s", (transport_id,))
        cursor.execute("UPDATE Orders SET Status = 'SHIPPED' WHERE OrderID = %s", (order_id,))
        
        conn.commit()
        return {"message": "Order marked as SHIPPED and is now IN_TRANSIT", "TransportID": transport_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.put("/{transport_id}/status")
def update_transport_status(transport_id: int, status_update: StatusUpdate):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
        
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cursor.execute("SELECT OrderID FROM Transport WHERE TransportID = %s", (transport_id,))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Transport not found")
        order_id = result['OrderID']
        
        cursor.execute("UPDATE Transport SET Status = %s WHERE TransportID = %s", (status_update.status, transport_id))
        cursor.execute("UPDATE Orders SET Status = 'DELIVERED' WHERE OrderID = %s", (order_id,))
        
        conn.commit()
        return {"message": "Transport status updated", "TransportID": transport_id, "status": status_update.status}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
