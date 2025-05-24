import type {Award} from "../../../data/Types";

interface Props {
  awards: Array<Award>;
}
export default function Awards({ awards }: Props) {
  return (
    <div className="awards">
      <h3>Awards</h3>
      <table className="info-table">
        <thead>
          <tr>
            <th style={{ flex: 4, textAlign: "left" }}>Name of Award</th>
            <th style={{ flex: 1, textAlign: "right" }}>Received</th>
          </tr>
        </thead>
        <tbody>
          {awards.map((a: Award, index: number) => (
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
