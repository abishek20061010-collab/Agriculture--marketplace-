from fastapi import APIRouter, HTTPException
from database import execute_query
from schemas import FarmerCreate

router = APIRouter()

@router.get("/verify/{farmer_id}")
def verify_farmer(farmer_id: int):
    result = execute_query("SELECT FarmerID, Name, Location FROM Farmer WHERE FarmerID = %s", (farmer_id,))
    if not result:
        raise HTTPException(status_code=404, detail=f"Farmer ID {farmer_id} not found in the system.")
    return result[0]

@router.get("/all")
def get_all_farmers():
    query = "SELECT FarmerID, Name, Phone, Location FROM Farmer ORDER BY Name"
    return execute_query(query)

@router.get("/details")
def get_farmer_details():
    query = """
        SELECT F.FarmerID, F.Name, F.Phone, F.Location AS FarmerHome,
               C.CropName, WC.Quantity, W.Location AS WarehouseLocation
        FROM Farmer F
        LEFT JOIN Crop C ON F.FarmerID = C.FarmerID
        LEFT JOIN WarehouseCrop WC ON C.CropID = WC.CropID
        LEFT JOIN Warehouse W ON WC.WarehouseID = W.WarehouseID
        ORDER BY F.Name
    """
    return execute_query(query)

@router.post("/add")
def add_farmer(farmer: FarmerCreate):
    query = "INSERT INTO Farmer (FarmerID, Name, Phone, Location) VALUES (%s, %s, %s, %s)"
    execute_query(query, (farmer.FarmerID, farmer.Name, farmer.Phone, farmer.Location), fetch=False)
    return {"message": "Farmer added successfully", "FarmerID": farmer.FarmerID}
