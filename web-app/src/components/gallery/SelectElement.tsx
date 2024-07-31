import { ChangeEvent } from "react";

interface Props {
  title: string;
  options: string[];
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const SelectElement = ({ title, handleChange, options }: Props) => {
  return (
    <select className="select-filter" onChange={handleChange}>
      <option value="">{title}</option>
      {options.map((option: string, index: number) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default SelectElement;
