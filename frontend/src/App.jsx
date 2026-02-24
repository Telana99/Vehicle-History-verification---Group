import { useMemo, useState } from "react";
import { ethers } from "ethers";
import artifact from "./abi/VehicleServiceHistory.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ABI = artifact.abi ?? artifact;

export default function App() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("");

  const [centerAddr, setCenterAddr] = useState("");
  const [centerName, setCenterName] = useState("");

  const [vehicleId, setVehicleId] = useState("ABC123");
  const [serviceType, setServiceType] = useState("Oil Change");
  const [mileage, setMileage] = useState(50000);
  const [description, setDescription] = useState("Synthetic 5W-30 + new filter");

  const [records, setRecords] = useState([]);

  const hasMetaMask = typeof window !== "undefined" && window.ethereum;

  const provider = useMemo(() => {
    if (!hasMetaMask) return null;
    return new ethers.BrowserProvider(window.ethereum);
  }, [hasMetaMask]);

  async function connectWallet() {
    try {
      if (!hasMetaMask) return setStatus("❌ MetaMask not found.");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setStatus("✅ Wallet connected");
    } catch (e) {
      setStatus(`❌ ${shortErr(e)}`);
    }
  }

  async function getContract(withSigner) {
    if (!provider) throw new Error("MetaMask provider not available");
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  }

  async function addServiceCenter() {
    try {
      setStatus("⏳ Adding service center...");
      const c = await getContract(true);
      const tx = await c.addServiceCenter(centerAddr, centerName);
      await tx.wait();
      setStatus("✅ Service center added!");
    } catch (e) {
      setStatus(`❌ ${shortErr(e)}`);
    }
  }

  async function addServiceRecord() {
    try {
      setStatus("⏳ Adding service record...");
      const c = await getContract(true);
      const tx = await c.addServiceRecord(vehicleId, serviceType, Number(mileage), description);
      await tx.wait();
      setStatus("✅ Service record added!");
    } catch (e) {
      setStatus(`❌ ${shortErr(e)}`);
    }
  }

  async function checkAuthorized() {
    try {
      const c = await getContract(false);
      const isAuth = await c.isAuthorizedCenter(account);
      setStatus(isAuth ? "✅ You are an authorized service center" : "ℹ️ You are NOT authorized");
    } catch (e) {
      setStatus(`❌ ${shortErr(e)}`);
    }
  }

  async function loadHistory() {
    try {
      setStatus("⏳ Loading vehicle history...");
      const c = await getContract(false);

      const countBN = await c.getRecordCount(vehicleId);
      const count = Number(countBN);

      const out = [];
      for (let i = 0; i < count; i++) {
        const r = await c.getServiceRecordByIndex(vehicleId, i);

        const timestamp = Number(r[0]);
        const vId = r[1];
        const sType = r[2];
        const mil = Number(r[3]);
        const desc = r[4];
        const center = r[5];

        let name = "";
        try {
          name = await c.getServiceCenterName(center);
        } catch {}

        out.push({
          timestamp,
          date: new Date(timestamp * 1000).toLocaleString(),
          vehicleId: vId,
          serviceType: sType,
          mileage: mil,
          description: desc,
          serviceCenter: center,
          centerName: name,
        });
      }

      setRecords(out);
      setStatus(`✅ Loaded ${count} record(s) for ${vehicleId}`);
    } catch (e) {
      setStatus(`❌ ${shortErr(e)}`);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "32px auto", fontFamily: "Arial, sans-serif" }}>
      <h2>🚗 Vehicle Service History (Blockchain)</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={connectWallet}>
          {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
        </button>
        <button onClick={checkAuthorized} disabled={!account}>Check Authorized</button>
      </div>

      <p style={{ marginTop: 10 }}><b>Status:</b> {status}</p>

      <hr />

      <h3>1) Owner: Add Authorized Service Center</h3>
      <p style={{ marginTop: 0, color: "#444" }}>
        Use the <b>Owner account</b> (Hardhat Account #0) in MetaMask to add service centers.
      </p>
      <input
        value={centerAddr}
        onChange={(e) => setCenterAddr(e.target.value)}
        placeholder="Service center address (0x...)"
        style={inputStyle}
      />
      <input
        value={centerName}
        onChange={(e) => setCenterName(e.target.value)}
        placeholder="Service center name"
        style={inputStyle}
      />
      <button onClick={addServiceCenter} disabled={!account}>Add Service Center</button>

      <hr />

      <h3>2) Service Center: Add Service Record</h3>
      <input
        value={vehicleId}
        onChange={(e) => setVehicleId(e.target.value)}
        placeholder="Vehicle ID (e.g., ABC123)"
        style={inputStyle}
      />
      <input
        value={serviceType}
        onChange={(e) => setServiceType(e.target.value)}
        placeholder="Service type"
        style={inputStyle}
      />
      <input
        type="number"
        value={mileage}
        onChange={(e) => setMileage(e.target.value)}
        placeholder="Mileage"
        style={inputStyle}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={3}
        style={{ ...inputStyle, resize: "vertical" }}
      />
      <button onClick={addServiceRecord} disabled={!account}>Add Record</button>

      <hr />

      <h3>3) Buyer/Anyone: View Vehicle History</h3>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          placeholder="Vehicle ID"
          style={{ ...inputStyle, maxWidth: 260 }}
        />
        <button onClick={loadHistory}>Load History</button>
      </div>

      <div style={{ marginTop: 16 }}>
        {records.length === 0 ? (
          <p>No records loaded yet.</p>
        ) : (
          records.map((r, idx) => (
            <div key={idx} style={cardStyle}>
              <h4 style={{ margin: "0 0 8px 0" }}>Record #{idx + 1}</h4>
              <div><b>Date:</b> {r.date}</div>
              <div><b>Service:</b> {r.serviceType}</div>
              <div><b>Mileage:</b> {r.mileage} km</div>
              <div><b>Description:</b> {r.description}</div>
              <div><b>Service Center:</b> {r.centerName ? `${r.centerName} (${r.serviceCenter})` : r.serviceCenter}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function shortErr(e) {
  return e?.reason || e?.shortMessage || e?.message || "Transaction failed";
}

const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const cardStyle = {
  background: "#f7f7f7",
  padding: 14,
  borderRadius: 10,
  marginBottom: 12,
};