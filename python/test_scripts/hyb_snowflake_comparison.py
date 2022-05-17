# gets contents of python folder for import
import sys
sys.path.append('../')
import config
import db
import pandas as pd
#-----------------------------------------------------
# Gets list of hana pks for yesterday
#-----------------------------------------------------
def get_hana_records():
    hana_query = """
    SELECT
        u.PK as pk,
        u.P_UID as hana_uid
    FROM
        slthybschema.users u
    WHERE
        days_between(CAST(u.createdts AS date), current_date) = 1
    """
    hana_cur, hana_conn= db.connect('hana_t1')
    hana_df = pd.read_sql_query(hana_query, hana_conn)
    print(hana_df)
    # hana_cur.execute(hana_query)
    # for row in hana_cur:
    #     print(row)
#-----------------------------------------------------
# Main Function
#-----------------------------------------------------
def main():
    get_hana_records()
if __name__ == '__main__':
    main()
