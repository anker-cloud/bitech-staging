import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function ApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dc4ai.replit.app';

  const curlExample = `curl -X GET "${baseUrl}/api/v1/fetch?columns=city_name,title&limit=10" \\
  -H "x-api-key: dc4ai_your-api-key-here" \\
  -H "x-data-source: crime-data-db" \\
  -H "Accept: application/json"`;

  const pythonExample = `import requests

url = "${baseUrl}/api/v1/fetch"
headers = {
    "x-api-key": "dc4ai_your-api-key-here",
    "x-data-source": "crime-data-db",
    "Accept": "application/json"
}
params = {
    "columns": "city_name,title",
    "limit": 10
}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print(data)`;

  const javascriptExample = `const response = await fetch(
  "${baseUrl}/api/v1/fetch?columns=city_name,title&limit=10",
  {
    method: "GET",
    headers: {
      "x-api-key": "dc4ai_your-api-key-here",
      "x-data-source": "crime-data-db",
      "Accept": "application/json"
    }
  }
);

const data = await response.json();
console.log(data);`;

  const successResponse = `{
  "data": [
    {
      "city_name": "Berlin",
      "title": "Traffic incident on A100"
    },
    {
      "city_name": "Munich",
      "title": "Road construction update"
    }
  ],
  "meta": {
    "columns": ["city_name", "title"],
    "totalRows": 2,
    "limit": 10,
    "offset": 0,
    "executionTimeMs": 1523
  }
}`;

  const errorResponse401 = `{
  "message": "Invalid or revoked API key"
}`;

  const errorResponse403 = `{
  "message": "Access denied to columns: secret_column",
  "allowedColumns": ["city_name", "title", "date_time"]
}`;

  const errorResponse400 = `{
  "message": "Missing required header: x-data-source"
}`;

  const errorResponse500 = `{
  "message": "Query execution failed",
  "error": "Internal server error"
}`;

  return (
    <div className="h-full overflow-auto">
      <div className="flex">
        <div className="flex-1 p-6 max-w-4xl">
          <div className="space-y-8">
            <div>
              <Badge variant="outline" className="mb-2">REST API</Badge>
              <h1 className="text-3xl font-bold" data-testid="text-api-docs-title">Fetch Data</h1>
              <p className="text-muted-foreground mt-2">
                Retrieve data from available data sources with column selection, filtering, and pagination.
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
              <Badge className="bg-green-600 hover:bg-green-600">GET</Badge>
              <span className="text-muted-foreground">/api/v1/fetch</span>
            </div>

            <section id="overview">
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <p className="text-muted-foreground">
                The DC4AI Public API allows you to programmatically access data from our platform.
                Use your API key to authenticate requests and retrieve data from authorized data sources.
                All requests inherit the permissions of the user who created the API key, including
                column-level and row-level access restrictions.
              </p>
            </section>

            <section id="base-url" data-testid="section-base-url">
              <h2 className="text-xl font-semibold mb-4">Base URL</h2>
              <Table data-testid="table-base-url">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Environment</TableHead>
                    <TableHead>URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline">Staging</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {baseUrl}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="secondary">Production</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {baseUrl.replace('-00-', '-').replace('.janeway.replit.dev', '.replit.app')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>

            <section id="headers" data-testid="section-headers">
              <h2 className="text-xl font-semibold mb-4">Headers</h2>
              <Table data-testid="table-headers">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Key</TableHead>
                    <TableHead className="w-48">Value</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">
                      x-api-key
                      <Badge variant="destructive" className="ml-2 text-xs">required</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      dc4ai_xxx...
                    </TableCell>
                    <TableCell>
                      Your API key generated from the API Keys page. Keys are prefixed with <code className="bg-muted px-1 rounded">dc4ai_</code>.
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">
                      x-data-source
                      <Badge variant="destructive" className="ml-2 text-xs">required</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      crime-data-db
                    </TableCell>
                    <TableCell>
                      The database name to query. Available sources: <code className="bg-muted px-1 rounded">crime-data-db</code>, <code className="bg-muted px-1 rounded">events-data-db</code>, <code className="bg-muted px-1 rounded">insurance-data-db</code>, <code className="bg-muted px-1 rounded">traffic-data-db</code>, <code className="bg-muted px-1 rounded">weather-data-db</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">
                      Accept
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      application/json
                    </TableCell>
                    <TableCell>
                      Response format. Use <code className="bg-muted px-1 rounded">application/json</code> (default) or <code className="bg-muted px-1 rounded">text/csv</code> for CSV download.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>

            <section id="query-params" data-testid="section-query-params">
              <h2 className="text-xl font-semibold mb-4">Query Parameters</h2>
              <Table data-testid="table-query-params">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Key</TableHead>
                    <TableHead className="w-32">Type</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">columns</TableCell>
                    <TableCell className="text-muted-foreground">string</TableCell>
                    <TableCell>
                      Comma-separated list of column names to return. If omitted, returns all columns you have access to.
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">limit</TableCell>
                    <TableCell className="text-muted-foreground">integer</TableCell>
                    <TableCell>
                      Maximum number of rows to return. Default: 100, Maximum: 1000.
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">
                      <span className="text-muted-foreground italic">[column_name]</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">string</TableCell>
                    <TableCell>
                      Any additional parameter is treated as an equals filter. For example, <code className="bg-muted px-1 rounded">city_name=Berlin</code> filters rows where city_name equals "Berlin".
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>

            <section id="response" data-testid="section-response">
              <h2 className="text-xl font-semibold mb-4">Response</h2>
              <p className="text-muted-foreground mb-4">
                Successful responses return JSON with a <code className="bg-muted px-1 rounded">data</code> array and <code className="bg-muted px-1 rounded">meta</code> object.
              </p>
              
              <h3 className="text-lg font-medium mb-3">Data Dictionary</h3>
              <Table data-testid="table-data-dictionary">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Field</TableHead>
                    <TableHead className="w-32">Type</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">data</TableCell>
                    <TableCell className="text-muted-foreground">array</TableCell>
                    <TableCell>Array of row objects containing the requested columns.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">meta.columns</TableCell>
                    <TableCell className="text-muted-foreground">string[]</TableCell>
                    <TableCell>List of column names returned in the response.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">meta.totalRows</TableCell>
                    <TableCell className="text-muted-foreground">integer</TableCell>
                    <TableCell>Number of rows returned in this response.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">meta.limit</TableCell>
                    <TableCell className="text-muted-foreground">integer</TableCell>
                    <TableCell>The limit parameter used for this query.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">meta.offset</TableCell>
                    <TableCell className="text-muted-foreground">integer</TableCell>
                    <TableCell>The offset used (always 0, pagination not supported by Athena).</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">meta.executionTimeMs</TableCell>
                    <TableCell className="text-muted-foreground">integer</TableCell>
                    <TableCell>Query execution time in milliseconds.</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>

            <section id="response-codes" data-testid="section-response-codes">
              <h2 className="text-xl font-semibold mb-4">Response Codes</h2>
              <Table data-testid="table-response-codes">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Code</TableHead>
                    <TableHead className="w-40">Status</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Badge className="bg-green-600 hover:bg-green-600">200</Badge>
                    </TableCell>
                    <TableCell>OK</TableCell>
                    <TableCell>Request successful. Data returned in the response body.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="destructive">400</Badge>
                    </TableCell>
                    <TableCell>Bad Request</TableCell>
                    <TableCell>Missing required headers or invalid parameters.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="destructive">401</Badge>
                    </TableCell>
                    <TableCell>Unauthorized</TableCell>
                    <TableCell>Invalid or revoked API key.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="destructive">403</Badge>
                    </TableCell>
                    <TableCell>Forbidden</TableCell>
                    <TableCell>Access denied to the requested data source or columns.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="destructive">500</Badge>
                    </TableCell>
                    <TableCell>Server Error</TableCell>
                    <TableCell>Internal server error or query execution failed.</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>
          </div>
        </div>

        <div className="w-[400px] border-l bg-slate-900 dark:bg-slate-950 p-4 sticky top-0 h-screen overflow-auto z-50">
          <div className="space-y-6">
            <div>
              <Tabs defaultValue="curl" className="w-full" data-testid="tabs-code-examples">
                <div className="flex items-center justify-between mb-2">
                  <TabsList className="bg-slate-800">
                    <TabsTrigger value="curl" className="text-xs" data-testid="tab-curl">cURL</TabsTrigger>
                    <TabsTrigger value="python" className="text-xs" data-testid="tab-python">Python</TabsTrigger>
                    <TabsTrigger value="javascript" className="text-xs" data-testid="tab-javascript">JavaScript</TabsTrigger>
                  </TabsList>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400"
                    onClick={() => {
                      const code = document.querySelector('[data-code-active="true"]')?.textContent || curlExample;
                      copyToClipboard(code, 'code');
                    }}
                    data-testid="button-copy-code"
                  >
                    {copiedCode === 'code' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <TabsContent value="curl" className="mt-0">
                  <pre className="text-xs text-slate-300 bg-slate-800 p-4 rounded-lg overflow-x-auto" data-code-active="true">
                    <code>{curlExample}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="python" className="mt-0">
                  <pre className="text-xs text-slate-300 bg-slate-800 p-4 rounded-lg overflow-x-auto" data-code-active="true">
                    <code>{pythonExample}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="javascript" className="mt-0">
                  <pre className="text-xs text-slate-300 bg-slate-800 p-4 rounded-lg overflow-x-auto" data-code-active="true">
                    <code>{javascriptExample}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <div className="text-sm text-slate-400 mb-2">Response</div>
              <Tabs defaultValue="200" className="w-full" data-testid="tabs-response">
                <TabsList className="bg-slate-800 mb-2">
                  <TabsTrigger value="200" className="text-xs data-[state=active]:bg-green-600" data-testid="tab-response-200">200</TabsTrigger>
                  <TabsTrigger value="400" className="text-xs" data-testid="tab-response-400">400</TabsTrigger>
                  <TabsTrigger value="401" className="text-xs" data-testid="tab-response-401">401</TabsTrigger>
                  <TabsTrigger value="403" className="text-xs" data-testid="tab-response-403">403</TabsTrigger>
                  <TabsTrigger value="500" className="text-xs" data-testid="tab-response-500">500</TabsTrigger>
                </TabsList>
                <TabsContent value="200" className="mt-0">
                  <pre className="text-xs text-slate-300 bg-slate-800 p-4 rounded-lg overflow-x-auto">
                    <code>{successResponse}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="400" className="mt-0">
                  <pre className="text-xs text-slate-300 bg-slate-800 p-4 rounded-lg overflow-x-auto">
                    <code>{errorResponse400}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="401" className="mt-0">
                  <pre className="text-xs text-slate-300 bg-slate-800 p-4 rounded-lg overflow-x-auto">
                    <code>{errorResponse401}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="403" className="mt-0">
                  <pre className="text-xs text-slate-300 bg-slate-800 p-4 rounded-lg overflow-x-auto">
                    <code>{errorResponse403}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="500" className="mt-0">
                  <pre className="text-xs text-slate-300 bg-slate-800 p-4 rounded-lg overflow-x-auto">
                    <code>{errorResponse500}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
