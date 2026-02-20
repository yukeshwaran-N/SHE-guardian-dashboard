// src/pages/DebugUsers.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [tableInfo, setTableInfo] = useState<any>(null);

  const checkDirectQuery = async () => {
    setLoading(true);
    setError("");
    try {
      // Try direct query without any filters
      const { data, error } = await supabase
        .from('public_user')
        .select('*');
      
      if (error) throw error;
      
      console.log("Direct query result:", data);
      setUsers(data || []);
    } catch (err: any) {
      console.error("Query error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkTableExists = async () => {
    try {
      const { data, error } = await supabase
        .from('public_user')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          setError("Table 'public_user' does not exist!");
        } else {
          setError(error.message);
        }
      } else {
        setTableInfo({ exists: true, message: "Table exists and is accessible" });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🔧 Debug Users Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Supabase Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkDirectQuery} disabled={loading}>
              Test Direct Query
            </Button>
            <Button onClick={checkTableExists} variant="outline">
              Check Table Exists
            </Button>
          </div>

          {loading && <p>Loading...</p>}
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded">
              Error: {error}
            </div>
          )}

          {users.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Found {users.length} users:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(users, null, 2)}
              </pre>
            </div>
          )}

          {users.length === 0 && !error && !loading && (
            <p className="text-yellow-600">No users found in the table.</p>
          )}

          {tableInfo && (
            <div className="p-4 bg-green-50 text-green-600 rounded">
              {tableInfo.message}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>URL:</strong> {supabase.supabaseUrl}</p>
          <p><strong>Table:</strong> public_user</p>
          <p className="text-sm text-muted-foreground mt-2">
            Check browser console (F12) for more details
          </p>
        </CardContent>
      </Card>
    </div>
  );
}