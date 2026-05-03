from fastapi import APIRouter
from database import execute_query

router = APIRouter()

@router.get("/all")
def get_all_farmers():
    query = "SELECT FarmerID, Name, Phone, Location FROM Farmer ORDER BY Name"
    return execute_query(query)
