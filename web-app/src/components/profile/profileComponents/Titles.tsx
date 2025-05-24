import type {Title} from "../../../data/Types";

interface Props {
  titles: Array<Title>;
}
export default function Titles({ titles }: Props) {
  return (
    <div className="awards">
      <h3>Titles</h3>
      <table className="info-table">
        <thead>
          <tr>
            <th style={{ flex: 4, textAlign: "left" }}>Name of Title</th>
            <th style={{ flex: 1, textAlign: "right" }}>Received</th>
          </tr>
        </thead>
        <tbody>
          {titles.map((a, index) => (
            <tr key={index}>
              <td style={{ flex: 4, textAlign: "left" }}>{a.name}</td>
              <td style={{ flex: 1, textAlign: "right" }}>{a.number}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
