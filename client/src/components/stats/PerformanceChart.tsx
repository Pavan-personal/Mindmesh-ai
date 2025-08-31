
import React from "react";
import { 
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import CustomTooltip from "./CustomTooltip";

const performanceData = [
  { name: 'Week 1', score: 75 },
  { name: 'Week 2', score: 68 },
  { name: 'Week 3', score: 82 },
  { name: 'Week 4', score: 90 },
  { name: 'Week 5', score: 85 },
  { name: 'Week 6', score: 92 },
];

interface PerformanceChartProps {
  variants: any;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ variants }) => {
  return (
    <motion.div variants={variants}>
      <Card className="border border-white/10 bg-white/5 backdrop-blur shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6 text-white">Average Performance Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#AAAAAA" />
                <YAxis domain={[0, 100]} stroke="#AAAAAA" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#FFFFFF" 
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#FFFFFF" }}
                  activeDot={{ r: 8 }}
                  name="Average Score (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PerformanceChart;
