from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_connection
from routes import crop, orders, payment, transport, warehouse, revenue, stats, farmer, buyer

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(crop.router, prefix="/crop", tags=["Crop"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(payment.router, prefix="/payment", tags=["Payment"])
app.include_router(transport.router, prefix="/transport", tags=["Transport"])
app.include_router(warehouse.router, prefix="/warehouse", tags=["Warehouse"])
app.include_router(revenue.router, prefix="/revenue", tags=["Revenue"])
app.include_router(stats.router, prefix="/stats", tags=["Stats"])
app.include_router(farmer.router, prefix="/farmer", tags=["Farmer"])
app.include_router(buyer.router, prefix="/buyer", tags=["Buyer"])

@app.get("/")
def root():
    return {"status": "AgriChain API running", "version": "1.0"}

@app.on_event("startup")
def startup_event():
    conn = get_connection()
    if conn and conn.is_connected():
        print("✅ MySQL connected")
        conn.close()
    else:
        print("❌ DB error: Could not connect to MySQL database.")
