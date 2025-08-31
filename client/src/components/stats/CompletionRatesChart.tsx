
import React from "react";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import CustomTooltip from "./CustomTooltip";

const completionData = [
  { name: 'Mon', completed: 85, pending: 15 },
  { name: 'Tue', completed: 90, pending: 10 },
  { name: 'Wed', completed: 95, pending: 5 },
  { name: 'Thu', completed: 88, pending: 12 },
  { name: 'Fri', completed: 92, pending: 8 },
  { name: 'Sat', completed: 78, pending: 22 },
  { name: 'Sun', completed: 82, pending: 18 },
];

interface CompletionRatesChartProps {
  variants: any;
}

const CompletionRatesChart: React.FC<CompletionRatesChartProps> = ({ variants }) => {
  return (
    <motion.div variants={variants}>
      <Card className="border border-white/10 bg-white/5 backdrop-blur shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6 text-white">Quiz Completion Rates</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={completionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#AAAAAA" />
                <YAxis stroke="#AAAAAA" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#FFFFFF" name="Completed" />
                <Bar dataKey="pending" stackId="a" fill="#333333" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CompletionRatesChart;
