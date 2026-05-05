from fastapi import APIRouter, HTTPException
from database import execute_query
from schemas import BuyerCreate

router = APIRouter()

@router.get("/verify/{buyer_id}")
def verify_buyer(buyer_id: int):
    result = execute_query("SELECT BuyerID, Name, City FROM Buyer WHERE BuyerID = %s", (buyer_id,))
    if not result:
        raise HTTPException(status_code=404, detail=f"Buyer ID {buyer_id} not found in the system.")
    return result[0]

@router.get("/all")
def get_all_buyers():
    query = """
        SELECT B.BuyerID, B.Name, B.Phone, B.City,
               COUNT(CASE WHEN O.Status != 'CANCELLED' THEN O.OrderID ELSE NULL END) AS total_orders,
               COALESCE(SUM(CASE WHEN O.Status != 'CANCELLED' THEN O.Quantity * C.PricePerKg ELSE 0 END), 0) AS total_spent,
               MAX(CASE WHEN O.Status != 'CANCELLED' THEN O.OrderDate ELSE NULL END) AS last_order_date
        FROM Buyer B
        LEFT JOIN Orders O ON B.BuyerID = O.BuyerID
        LEFT JOIN Crop C ON O.CropID = C.CropID
        GROUP BY B.BuyerID, B.Name, B.Phone, B.City
        ORDER BY total_spent DESC
    """
    return execute_query(query)

@router.post("/add")
def add_buyer(buyer: BuyerCreate):
    query = "INSERT INTO Buyer (BuyerID, Name, Phone, City) VALUES (%s, %s, %s, %s)"
    execute_query(query, (buyer.BuyerID, buyer.Name, buyer.Phone, buyer.City), fetch=False)
    return {"message": "Buyer added successfully", "BuyerID": buyer.BuyerID}
