import { ChangeEvent } from "react";
import SelectElement from "./SelectElement";
import { FaFilter } from "react-icons/fa";
import "./Filter.css";

type FilterTypes = {
  countries: Array<string>;
  handleChange1: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleChange2: (e: ChangeEvent<HTMLSelectElement>) => void;
  applyFilter: () => void;
};

const Filter = ({
  countries,
  handleChange1,
  handleChange2,
  applyFilter,
}: FilterTypes) => {
  return (
    <div className="filter-container">
      <SelectElement
        title={"All Countries"}
        handleChange={handleChange1}
        options={countries}
      />
      <SelectElement
        title={"All age groups"}
        handleChange={handleChange2}
        options={["10-20", "20-30", "30-40", ">40"]}
      />
      <button className="btn-filter" onClick={applyFilter}>
        Filter <FaFilter />
      </button>
    </div>
  );
};
export default Filter;
