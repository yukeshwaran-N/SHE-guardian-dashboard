// src/pages/DebugPage.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableInfo, setTableInfo] = useState<any>({});

  const checkConnection = async () => {
    setLoading(true);
    setError("");
    try {
      // Test 1: Check if we can connect
      const { data, error } = await supabase
        .from('user')
        .select('*');
      
      if (error) throw error;
      
      setUsers(data || []);
      setTableInfo(prev => ({ ...prev, user: data?.length || 0 }));
      
    } catch (err: any) {
      setError(err.message);
      console.error("Connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkAllTables = async () => {
    const tables = ['user', 'alerts', 'women', 'deliveries', 'inventory'];
    const results: any = {};
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          results[table] = count || 0;
        } else {
          results[table] = '❌ Not found';
        }
      } catch {
        results[table] = '❌ Error';
      }
    }
    
    setTableInfo(results);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 Supabase Debug Page</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Connection Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={checkConnection} disabled={loading}>
                {loading ? "Testing..." : "Test Connection"}
              </Button>
              
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded">
                  Error: {error}
                </div>
              )}
              
              {users.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Users in database:</h3>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(users, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={checkAllTables} className="mb-4">
              Check All Tables
            </Button>
            
            {Object.keys(tableInfo).length > 0 && (
              <div className="bg-gray-100 p-4 rounded">
                {Object.entries(tableInfo).map(([table, count]) => (
                  <div key={table} className="flex justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{table}:</span>
                    <span>{String(count)} records</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick SQL Check</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Run this in Supabase SQL editor to see all tables:
            </p>
            <pre className="bg-gray-100 p-4 rounded text-sm">
              SELECT table_name, row_estimate 
              FROM information_schema.tables 
              WHERE table_schema = 'public'
              ORDER BY table_name;
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}