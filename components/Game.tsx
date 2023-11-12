import React from "react";
import Router from "next/router";
import ReactMarkdown from "react-markdown";

export type GameProps = {
  id: number;
  placement: number;
  headliner: {
    unit: {
      name: string;
    }
    trait: {
      name: string;
    }
  } | null;
  notes: string;
};

const Game: React.FC<{ game: GameProps }> = ({ game }) => {
  const headlinerName = game.headliner
    ? `${game.headliner.trait.name} ${game.headliner.unit.name}`
    : "No headliner";

  return (
    <div onClick={() => Router.push("/g/[id]", `/g/${game.id}`)}>
      <h2>{headlinerName}</h2>
      <small>Placement: {game.placement}</small>
      <ReactMarkdown children={game.notes} />
      <style jsx>{`
        div {
          color: inherit;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
};

export default Game;
