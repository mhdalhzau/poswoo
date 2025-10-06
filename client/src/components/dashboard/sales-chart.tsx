import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockChartData = [
  { day: "Mon", value: 75, amount: "$2,400" },
  { day: "Tue", value: 85, amount: "$2,800" },
  { day: "Wed", value: 92, amount: "$3,200" },
  { day: "Thu", value: 68, amount: "$2,100" },
  { day: "Fri", value: 95, amount: "$3,400" },
  { day: "Sat", value: 88, amount: "$3,000" },
  { day: "Sun", value: 100, amount: "$3,600" },
];

type Period = "week" | "month" | "year";

export default function SalesChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("week");

  return (
    <Card className="shadow-sm" data-testid="sales-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Sales Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Daily sales performance</p>
          </div>
          <div className="flex items-center space-x-2">
            {(["week", "month", "year"] as Period[]).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="capitalize"
                data-testid={`chart-period-${period}`}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between space-x-2">
          {mockChartData.map((data, index) => (
            <div key={data.day} className="flex-1 flex flex-col items-center space-y-2 group">
              <div 
                className="w-full bg-muted rounded-t-lg relative overflow-hidden transition-all hover:bg-muted/80"
                style={{ height: "180px" }}
              >
                <div
                  className={`absolute bottom-0 w-full rounded-t-lg transition-all ${
                    index === 6 ? "bg-accent" : "bg-primary"
                  }`}
                  style={{ height: `${data.value}%` }}
                  data-testid={`chart-bar-${data.day.toLowerCase()}`}
                />
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {data.amount}
                </div>
              </div>
              <span className={`text-xs ${index === 6 ? "text-accent font-medium" : "text-muted-foreground"}`}>
                {data.day}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
