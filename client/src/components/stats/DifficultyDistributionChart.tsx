
import React from "react";
import { 
  Cell, 
  Legend, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import CustomTooltip from "./CustomTooltip";

const difficultyData = [
  { name: 'Easy', value: 30, color: '#FFFFFF' },
  { name: 'Medium', value: 45, color: '#AAAAAA' },
  { name: 'Hard', value: 25, color: '#666666' },
];

interface DifficultyDistributionChartProps {
  variants: any;
}

const DifficultyDistributionChart: React.FC<DifficultyDistributionChartProps> = ({ variants }) => {
  return (
    <motion.div variants={variants}>
      <Card className="border border-white/10 bg-white/5 backdrop-blur shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6 text-white">Question Difficulty Distribution</h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="hover:opacity-80 transition-opacity duration-300"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DifficultyDistributionChart;
