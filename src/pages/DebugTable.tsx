// src/pages/DebugTable.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DebugTable() {
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkTables = async () => {
    setLoading(true);
    try {
      // Check what tables exist
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      console.log("Available tables:", tables);

      // Try querying 'users' table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      // Try querying 'user' table
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('*')
        .limit(1);

      setTableInfo({
        tables: tables,
        users: { data: usersData, error: usersError },
        user: { data: userData, error: userError }
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Database Debug</h1>
      <Button onClick={checkTables} disabled={loading}>
        Check Tables
      </Button>
      
      {tableInfo && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded">
                {JSON.stringify(tableInfo.tables, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>'users' Table Query</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Error: {tableInfo.users.error?.message || 'No error'}</p>
              <p>Data: {tableInfo.users.data ? 'Found' : 'Not found'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>'user' Table Query</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Error: {tableInfo.user.error?.message || 'No error'}</p>
              <p>Data: {tableInfo.user.data ? 'Found' : 'Not found'}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}