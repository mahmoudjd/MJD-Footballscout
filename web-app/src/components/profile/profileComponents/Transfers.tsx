import { Transfer } from "../../../data/Types";
interface Props {
  transfers: Array<Transfer>;
}
export default function Transfers({ transfers }: Props) {
  return (
    <div className="transfers">
      <h3>Transfers</h3>
      <table className="info-table">
        <thead>
          <tr>
            <th style={{ flex: 1, textAlign: "left" }}>Season</th>
            <th style={{ flex: 4, textAlign: "center" }}>Team</th>
            <th style={{ flex: 1, textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t: Transfer, index: number) => (
            <tr key={index}>
              <td style={{ flex: 1, textAlign: "left" }}>{t.season}</td>
              <td style={{ flex: 4, textAlign: "center" }}>{t.team}</td>
              <td style={{ flex: 1, textAlign: "right" }}>
                {t.amount.replace("€", "")}
                {t.amount !== "Free Transfer" &&
                parseInt(t.amount) < 1000 &&
                t.amount
                  ? " €"
                  : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
