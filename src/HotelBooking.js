import React, { useState } from "react";
import "./HotelBooking.css"; // we'll add custom styles

export default function HotelBooking() {
  // Build initial hotel structure
  const initialRooms = {};
  for (let f = 1; f <= 9; f++) {
    initialRooms[f] = Array.from({ length: 10 }, (_, i) => f * 100 + (i + 1));
  }
  initialRooms[10] = Array.from({ length: 7 }, (_, i) => 1000 + (i + 1));

  const [available, setAvailable] = useState(initialRooms);
  const [numRooms, setNumRooms] = useState("");
  const [latestBooking, setLatestBooking] = useState([]);

  // travel time
  function travelTime(r1, r2) {
    const f1 = Math.floor(r1 / 100);
    const f2 = Math.floor(r2 / 100);
    const pos1 = r1 % 100;
    const pos2 = r2 % 100;

    if (f1 === f2) return Math.abs(pos1 - pos2);
    return pos1 - 1 + 2 * Math.abs(f1 - f2) + (pos2 - 1);
  }

  function bookRooms() {
    let n = parseInt(numRooms);
    if (isNaN(n) || n <= 0) return;
    if (n > 5) {
      alert("You cannot book more than 5 rooms at once.");
      return;
    }

    // Try same floor cluster
    for (let f = 1; f <= 10; f++) {
      let avail = available[f] || [];
      for (let i = 0; i <= avail.length - n; i++) {
        let slice = avail.slice(i, i + n);
        if (slice.length === n) {
          confirmBooking(slice);
          return;
        }
      }
    }

    // Else pick across floors
    let all = [];
    for (let f in available) all.push(...available[f]);
    all.sort((a, b) => a - b);
    confirmBooking(all.slice(0, n));
  }

  function confirmBooking(selected) {
    const newAvail = { ...available };
    selected.forEach((r) => {
      const f = Math.floor(r / 100);
      newAvail[f] = newAvail[f].filter((x) => x !== r);
    });
    setAvailable(newAvail);
    setLatestBooking(selected);
  }

  function randomize() {
    // Flatten all available rooms into one array
    const n=Number(numRooms);
    const allAvailable = Object.values(available).flat();

    // If n > available rooms, cap it
    const count = Math.min(n, allAvailable.length);

    // Randomly shuffle and pick 'count' rooms
    const chosen = allAvailable
      .sort(() => 0.5 - Math.random()) // shuffle
      .slice(0, count);

    // New availability after booking
    const newAvail = {};
    for (let f = 1; f <= 9; f++) {
      newAvail[f] = available[f].filter((room) => !chosen.includes(room));
    }
    newAvail[10] = available[10].filter((room) => !chosen.includes(room));

    // Update state
    setAvailable(newAvail);
    setLatestBooking(chosen);
  }

  function reset() {
    setAvailable(initialRooms);
    setLatestBooking([]);
    setNumRooms("");
  }

  // check if a room is available / booked
  function getRoomStatus(room) {
    for (let f in available) {
      if (available[f].includes(room)) return "available";
    }
    if (latestBooking.includes(room)) return "booked-now";
    return "booked";
  }

  return (
    <div className="hotel-container">
      <div className="control-panel">
        <h2>Hotel Booking</h2>
        <input
          type="number"
          value={numRooms}
          onChange={(e) => setNumRooms(e.target.value)}
          placeholder="Enter no. of rooms (max 5)"
        />
        <button onClick={bookRooms}>Book Rooms</button>
        <button onClick={randomize}>Random Occupancy</button>
        <button onClick={reset}> Reset</button>

        {latestBooking.length > 0 && (
          <div className="booking-info">
            <h3>Latest Booking</h3>
            <p>Rooms: {latestBooking.join(", ")}</p>
            <p>
              Travel Time:{" "}
              {travelTime(
                latestBooking[0],
                latestBooking[latestBooking.length - 1]
              )}{" "}
              minutes
            </p>
          </div>
        )}
      </div>

      <div className="hotel-layout">
        {Object.keys(initialRooms)
          .sort((a, b) => b - a) // show floor 10 at top
          .map((f) => (
            <div key={f} className="floor-row">
              <span className="floor-label">Floor {f}</span>
              <div className="rooms-row">
                {initialRooms[f].map((room) => {
                  const status = getRoomStatus(room);
                  return (
                    <div key={room} className={`room ${status}`}>
                      {room}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
