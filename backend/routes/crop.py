from fastapi import APIRouter, HTTPException
from database import execute_query
from schemas import CropCreate, PriceUpdate

router = APIRouter()

@router.get("/all")
def get_all_crops():
    query = """
        SELECT C.CropID, C.CropName, C.PricePerKg,
               F.Name AS FarmerName, F.Location AS FarmerLocation, F.FarmerID
        FROM Crop C JOIN Farmer F ON C.FarmerID = F.FarmerID
        ORDER BY C.CropName ASC
    """
    return execute_query(query)

@router.get("/farmer/{farmer_id}")
def get_crops_by_farmer(farmer_id: int):
    query = "SELECT * FROM Crop WHERE FarmerID = %s"
    return execute_query(query, (farmer_id,))

@router.post("/add")
def add_crop(crop: CropCreate):
    query = "INSERT INTO Crop (CropID, CropName, PricePerKg, FarmerID) VALUES (%s,%s,%s,%s)"
    execute_query(query, (crop.CropID, crop.CropName, crop.PricePerKg, crop.FarmerID), fetch=False)
    return {"message": "Crop added", "CropID": crop.CropID}

@router.put("/{crop_id}/price")
def update_crop_price(crop_id: int, price_data: PriceUpdate):
    query = "UPDATE Crop SET PricePerKg = %s WHERE CropID = %s"
    execute_query(query, (price_data.price, crop_id), fetch=False)
    return {"message": "Price updated", "CropID": crop_id, "new_price": price_data.price}

@router.delete("/{crop_id}")
def delete_crop(crop_id: int):
    query = "DELETE FROM Crop WHERE CropID = %s"
    execute_query(query, (crop_id,), fetch=False)
    return {"message": "Crop deleted", "CropID": crop_id}
