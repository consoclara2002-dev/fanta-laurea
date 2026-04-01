import { useEffect, useMemo, useState } from "react";
import { tasks } from "./data/tasks";
import { db } from "./firebase";
import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { useRef } from "react";

function App() {
  const [name, setName] = useState("");
  const [selectedTasks, setSelectedTasks] = useState({});
  const [players, setPlayers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const nameInputRef = useRef(null);

  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    }, {});
  }, []);

  const totalScore = useMemo(() => {
    return tasks.reduce((total, task) => {
      return selectedTasks[task.id] ? total + task.points : total;
    }, 0);
  }, [selectedTasks]);

  const handleToggleTask = (taskId) => {
    setSelectedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const generateId = (name) => {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  const handleSave = async () => {
    // 🔴 1. Controllo nome vuoto
    if (!name.trim()) {
      setMessage("⚠️ Inserisci nome e cognome per partecipare!");

      if (nameInputRef.current) {
        nameInputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        nameInputRef.current.focus();
      }

      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      // 🧠 2. Genera ID
      const playerId = generateId(name);
      const playerRef = doc(db, "players", playerId);

      // 🔍 3. Controlla se esiste già
      const existing = await getDoc(playerRef);

      if (existing.exists()) {
        setMessage("⚠️ Nome già utilizzato! Scegline un altro.");
        setIsSaving(false);
        return;
      }

      // 💾 4. Salva
      await setDoc(playerRef, {
        name: name.trim(),
        score: totalScore,
        tasks: selectedTasks,
        updatedAt: new Date()
      });

      setMessage("Punteggio salvato!");
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      setMessage("Errore durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "players"), orderBy("score", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playersData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="app-container">
      <div className="card">
        <h1>🎓FANTA LAUREA🎓</h1>
        <h2>La tesi è finita, la sfida comincia!</h2>
        <p className="subtitle">Seleziona le missioni che hai completato</p>

        <div className="input-group">
          {message && (
            <div className="error-message">
              {message}
            </div>
          )}

          <label htmlFor="name">Il tuo nome</label>

          <input
            ref={nameInputRef}
            id="name"
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (message.includes("nome")) {
                setMessage("");
              }
            }}
            className={!name.trim() && message ? "input-error" : ""}
          />
        </div>

        <div className="score-box">
          <span>Punteggio totale</span>
          <strong>{totalScore} pt</strong>
        </div>

        {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
          <div key={category} className="section">
            <h2>{category}</h2>

            {categoryTasks.map((task) => (
              <label key={task.id} className="task-item">
                <input
                  type="checkbox"
                  checked={!!selectedTasks[task.id]}
                  onChange={() => handleToggleTask(task.id)}
                />
                <span>
                  {task.label} ({task.points > 0 ? "+" : ""}
                  {task.points} pt)
                </span>
              </label>
            ))}
          </div>
        ))}

        <button className="save-button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Salvataggio..." : "Salva punteggio"}
        </button>

        <div className="section leaderboard">
          <h2>Classifica live</h2>
          {players.length === 0 ? (
            <p>Nessun partecipante ancora salvato.</p>
          ) : (
            players.map((player, index) => (
              <div key={player.id} className="leaderboard-item">
                <span>
                  {index + 1}. {player.name}
                </span>
                <strong>{player.score} pt</strong>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;