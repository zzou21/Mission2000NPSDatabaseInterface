import pandas_access as mdb
import pandas as pd
import os

# Path to MDB file
mdb_path = "/Users/Jerry/Desktop/DH proj-reading/Mission2000NPSDatabaseInterface/dataProcessing/mission2000.mdb"

# Output folder
output_folder = "/Users/Jerry/Desktop/DH proj-reading/Mission2000NPSDatabaseInterface/dataProcessing"
os.makedirs(output_folder, exist_ok=True)

# Get all table names
tables = mdb.list_tables(mdb_path)
print("Tables found:", tables)

# Export each table to CSV
for table in tables:
    df = mdb.read_table(mdb_path, table)
    csv_path = os.path.join(output_folder, f"{table}.csv")
    df.to_csv(csv_path, index=False, encoding="utf-8")
    print(f"Exported {table} to {csv_path}")




# # Path to your MDB file

# # mdb_path = r"/Users/Jerry/Desktop/DH proj-reading/Mission2000NPSDatabaseInterface/dataProcessing/mission2000.mdb"
# mdb_path = "/Users/Jerry/Desktop/DH proj-reading/Mission2000NPSDatabaseInterface/dataProcessing/DailyFeature.mdb"
# # Get all table names
# tables = mdb.list_tables(mdb_path)
# print("Tables:", tables)

# # Read data from each table
# for table in tables:
#     df = mdb.read_table(mdb_path, table)
#     print(f"\nData from {table}:")
#     print(df.head())  # Print first few rows
