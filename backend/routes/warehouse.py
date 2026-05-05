from fastapi import APIRouter
from database import execute_query
from schemas import AllocationCreate, LocationUpdate, WarehouseCreate

router = APIRouter()

@router.post("/add")
def add_warehouse(warehouse: WarehouseCreate):
    query = "INSERT INTO Warehouse (WarehouseID, Location, Capacity) VALUES (%s, %s, %s)"
    execute_query(query, (warehouse.WarehouseID, warehouse.Location, warehouse.Capacity), fetch=False)
    return {"message": "Warehouse created successfully", "WarehouseID": warehouse.WarehouseID}

@router.get("/all")
def get_all_warehouses():
    query = "SELECT * FROM Warehouse ORDER BY Location"
    return execute_query(query)

@router.get("/farmer/{farmer_id}")
def get_warehouse_by_farmer(farmer_id: int):
    query = """
        SELECT WC.WarehouseID, WC.CropID, WC.Quantity,
               W.Location, W.Capacity, C.CropName
        FROM WarehouseCrop WC
        JOIN Warehouse W ON WC.WarehouseID=W.WarehouseID
        JOIN Crop C ON WC.CropID=C.CropID
        JOIN Farmer F ON C.FarmerID=F.FarmerID
        WHERE F.FarmerID=%s
    """
    return execute_query(query, (farmer_id,))

@router.get("/allocations")
def get_warehouse_allocations():
    query = """
        SELECT WC.WarehouseID, WC.CropID, WC.Quantity,
               W.Location, W.Capacity,
               C.CropName, C.PricePerKg,
               F.Name AS FarmerName
        FROM WarehouseCrop WC
        JOIN Warehouse W ON WC.WarehouseID = W.WarehouseID
        JOIN Crop C ON WC.CropID = C.CropID
        JOIN Farmer F ON C.FarmerID = F.FarmerID
        ORDER BY W.Location, C.CropName
    """
    return execute_query(query)

@router.post("/allocation")
def create_warehouse_allocation(allocation: AllocationCreate):
    query = """
        INSERT INTO WarehouseCrop (WarehouseID, CropID, Quantity)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE Quantity = Quantity + VALUES(Quantity)
    """
    execute_query(query, (allocation.WarehouseID, allocation.CropID, allocation.Quantity), fetch=False)
    return {"message": "Allocation created/updated"}

@router.put("/allocation")
def update_warehouse_allocation(allocation: AllocationCreate):
    query = "UPDATE WarehouseCrop SET Quantity = %s WHERE WarehouseID = %s AND CropID = %s"
    execute_query(query, (allocation.Quantity, allocation.WarehouseID, allocation.CropID), fetch=False)
    return {"message": "Allocation updated"}

@router.put("/{warehouse_id}/location")
def update_warehouse_location(warehouse_id: int, location_update: LocationUpdate):
    query = "UPDATE Warehouse SET Location = %s WHERE WarehouseID = %s"
    execute_query(query, (location_update.location, warehouse_id), fetch=False)
    return {"message": "Location updated"}

@router.get("/stats")
def get_warehouse_stats():
    total_crops = execute_query("SELECT COUNT(*) AS count FROM Crop")[0]['count']
    total_farmers = execute_query("SELECT COUNT(DISTINCT FarmerID) AS count FROM Crop")[0]['count']
    total_orders = execute_query("SELECT COUNT(*) AS count FROM Orders")[0]['count']
    pending_orders = execute_query("SELECT COUNT(*) AS count FROM Orders WHERE Status = 'PLACED'")[0]['count']
    active_deliveries = execute_query("SELECT COUNT(*) AS count FROM Transport WHERE Status = 'IN_TRANSIT'")[0]['count']
    
    return {
        "total_crops": total_crops,
        "total_farmers": total_farmers,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "active_deliveries": active_deliveries
    }

@router.get("/analytics")
def get_warehouse_analytics():
    rev_crop_query = """
        SELECT C.CropName, SUM(O.Quantity * C.PricePerKg) AS revenue
        FROM Orders O JOIN Crop C ON O.CropID = C.CropID
        WHERE O.Status != 'CANCELLED'
        GROUP BY C.CropName ORDER BY revenue DESC
    """
    ord_status_query = """
        SELECT Status, COUNT(*) AS count FROM Orders GROUP BY Status
    """
    rev_farmer_query = """
        SELECT F.Name AS FarmerName,
               SUM(O.Quantity * C.PricePerKg) AS revenue
        FROM Orders O
        JOIN Crop C ON O.CropID = C.CropID
        JOIN Farmer F ON C.FarmerID = F.FarmerID
        GROUP BY F.Name ORDER BY revenue DESC
    """
    month_trend_query = """
        SELECT DATE_FORMAT(OrderDate, '%b %Y') AS month,
               COUNT(*) AS orders,
               SUM(Quantity * PricePerKg) AS revenue
        FROM Orders O JOIN Crop C ON O.CropID = C.CropID
        GROUP BY month ORDER BY MIN(OrderDate)
    """
    
    return {
        "revenue_by_crop": execute_query(rev_crop_query),
        "orders_by_status": execute_query(ord_status_query),
        "revenue_by_farmer": execute_query(rev_farmer_query),
        "monthly_trend": execute_query(month_trend_query)
    }
