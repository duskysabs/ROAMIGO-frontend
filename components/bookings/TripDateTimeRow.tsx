import TripDatePicker from "./TripDatePicker";
import TripTimePicker from "./TripTimePicker";

type TripDateTimeRowProps = {
  id: string;
  label: string;
  value: string;
  minDate?: string;
  error?: string;
  onChange: (value: string) => void;
};

function splitDateTime(value: string) {
  const [date = "", time = ""] = value.split("T");
  return { date, time };
}

function joinDateTime(date: string, time: string) {
  if (!date && !time) return "";
  return `${date}T${time}`;
}

export default function TripDateTimeRow({ id, label, value, minDate, error, onChange }: TripDateTimeRowProps) {
  const { date, time } = splitDateTime(value);
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="mt-3 grid gap-4">
        <TripDatePicker id={`${id}-date`} label={label} value={date} min={minDate}
          describedBy={errorId} invalid={Boolean(error)}
          onChange={(nextDate) => onChange(joinDateTime(nextDate, time))} />
        <TripTimePicker id={`${id}-time`} label={label} value={time}
          describedBy={errorId} invalid={Boolean(error)}
          onChange={(nextTime) => onChange(joinDateTime(date, nextTime))} />
      </div>
      {error && <p id={errorId} className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}
