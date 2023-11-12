import React from "react"
import { GetServerSideProps } from "next"
import ReactMarkdown from "react-markdown"
import Layout from "../../components/Layout"
import { GameProps } from "../../components/Game"

import prisma from '../../lib/prisma';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const game = await prisma.game.findUnique({
    where: {
      id: +params.id,
    }
  })
  return {
    props: game,
  }
}

const Game: React.FC<GameProps> = (props) => {
  const headlinerName = props.headliner
    ? `${props.headliner.trait.name} ${props.headliner.unit.name}`
    : "No headliner";

  return (
    <Layout>
      <div>
        <h2>{headlinerName}</h2>
        <p>Placement: {props.placement}</p>
        <ReactMarkdown children={props.notes} />
      </div>
      <style jsx>{`
        .game {
          background: white;
          padding: 2rem;
        }

        .actions {
          margin-top: 2rem;
        }

        button {
          background: #ececec;
          border: 0;
          border-radius: 0.125rem;
          padding: 1rem 2rem;
        }

        button + button {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  )
}

export default Game
