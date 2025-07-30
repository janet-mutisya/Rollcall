
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import moment from "moment";

const HolidayAttendanceCard = ({ record }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{record.holiday.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-600 space-y-1">
        <p>Holiday Date: {moment(record.holiday.date).format('DD MMM YYYY')}</p>
        <p>Date Worked: {moment(record.dateWorked).format('DD MMM YYYY')}</p>
      </CardContent>
      <CardFooter>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          Paid
        </span>
      </CardFooter>
    </Card>
  );
};

export default HolidayAttendanceCard;
