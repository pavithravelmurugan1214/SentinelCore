package backend;

import org.junit.jupiter.api.Test;
import java.sql.*;

public class MyDbTest {

    @Test
    public void testPostgresConnection() {
        String[] usernames = {"postgres", "akhi", "Akhi"};
        String[] passwords = {
            "postgres123",
            "Akhi 140808",
            "akhi 140808",
            "Akhi140808",
            "akhi140808",
            "Akhi @140808",
            "akhi @140808",
            "Akhi@140808",
            "akhi@140808",
            "Postgres@123",
            "postgres",
            "admin",
            "password",
            "123456",
            "root",
            ""
        };
        String url = "jdbc:postgresql://localhost:5432/sentinelcore";

        System.out.println("=================================================");
        System.out.println("STARTING POSTGRES MULTI-USER/PWD DIAGNOSTIC");
        System.out.println("=================================================");

        for (String user : usernames) {
            for (String pwd : passwords) {
                try {
                    Connection conn = DriverManager.getConnection(url, user, pwd);
                    System.out.println("SUCCESS: Connected with username: '" + user + "' and password: '" + pwd + "'");
                    
                    // Print table schema of incidents
                    DatabaseMetaData meta = conn.getMetaData();
                    ResultSet rs = meta.getColumns(null, null, "incidents", null);
                    System.out.println("Columns in 'incidents' table:");
                    boolean found = false;
                    while (rs.next()) {
                        found = true;
                        String columnName = rs.getString("COLUMN_NAME");
                        String columnType = rs.getString("TYPE_NAME");
                        System.out.println("  - " + columnName + " (" + columnType + ")");
                    }
                    if (!found) {
                        System.out.println("  - Table 'incidents' does NOT exist!");
                    }
                    rs.close();

                    // Print rows in iocs table
                    try {
                        Statement stmt = conn.createStatement();
                        ResultSet iocRs = stmt.executeQuery("SELECT id, type, value, risk_level, status FROM ioc");
                        System.out.println("Rows in 'ioc' table:");
                        while (iocRs.next()) {
                            System.out.println("  - ID: " + iocRs.getLong("id") + ", Type: " + iocRs.getString("type") + ", Value: " + iocRs.getString("value") + ", Risk: " + iocRs.getString("risk_level") + ", Status: " + iocRs.getString("status"));
                        }
                        iocRs.close();

                        // Print rows in alert_rules table
                        ResultSet rulesRs = stmt.executeQuery("SELECT id, name, event_type, enabled FROM alert_rules");
                        System.out.println("Rows in 'alert_rules' table:");
                        while (rulesRs.next()) {
                            System.out.println("  - ID: " + rulesRs.getLong("id") + ", Name: " + rulesRs.getString("name") + ", EventType: " + rulesRs.getString("event_type") + ", Enabled: " + rulesRs.getBoolean("enabled"));
                        }
                        rulesRs.close();
                        stmt.close();
                    } catch (Exception e) {
                        System.out.println("Error querying tables: " + e.getMessage());
                    }
                    
                    conn.close();
                    System.out.println("=================================================");
                    return;
                } catch (SQLException e) {
                    System.out.println("TRY FAILED: User: '" + user + "' | Pwd: '" + pwd + "' | Error: " + e.getMessage());
                }
            }
        }
        System.out.println("ALL USERNAME/PASSWORD COMBINATIONS FAILED!");
        System.out.println("=================================================");
    }
}
