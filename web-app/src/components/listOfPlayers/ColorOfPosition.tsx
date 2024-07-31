import "./ColorOfPosition.css";

interface PositionItem {
  color: string;
  position: string;
}

interface Props {
  filterByPosition: (position: string) => void;
}
const ColorsOfPositions = ({ filterByPosition }: Props) => {
  const items: PositionItem[] = [
    { color: "#c3c3c3", position: "" },
    { color: "#c33d17", position: "Forward" },
    { color: "#044c98", position: "Defender" },
    { color: "#279766", position: "Midfielder" },
    { color: "rgba(201, 154, 32, 0.7)", position: "Goalkeeper" },
  ];
  return (
    <div className="hint-container">
      {items.map((item: PositionItem, index: number) => (
        <div
          key={index}
          className={`${item.position}${item.color === "#c3c3c3" ? "all" : ""}`}
          style={{
            padding: "0 2px",
            display: "flex",
            gap: "4px",
            cursor: "pointer",
          }}
          onClick={() => filterByPosition(item.position)}
        >
          <div
            className="color-circle"
            style={{ backgroundColor: item.color }}
          ></div>
          <div className="color-text">{item.position || "All"}</div>
        </div>
      ))}
    </div>
  );
};

export default ColorsOfPositions;
