import type {Attribute} from "../../../data/Types";

interface Props {
  attributes: Array<Attribute>;
}
export default function Attributes({ attributes }: Props) {
  return (
    <div className="awards">
      <h3>Attributes</h3>
      <table className="info-table">
        <thead>
          <tr>
            <th style={{ flex: 4, textAlign: "left" }}>Name of Attributes</th>
            <th style={{ flex: 1, textAlign: "right" }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {attributes.map((a: Attribute, index: number) => (
            <tr key={index}>
              <td style={{ flex: 4, textAlign: "left" }}>{a.name}</td>
              <td style={{ flex: 1, textAlign: "right" }}>{a.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
