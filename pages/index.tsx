import React from "react"
import { GetStaticProps } from "next"
import Layout from "../components/Layout"
import Game, { GameProps } from "../components/Game"

import prisma from '../lib/prisma';

export const getStaticProps: GetStaticProps = async () => {
  const log = await prisma.game.findMany({
    include: {
      gameUnits: {
        select: {
          unit: {
            select: {
              name: true,
              traits: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return {
    props: { log },
  }
}

type Props = {
  log: GameProps[]
}

const Log: React.FC<Props> = (props) => {
  return (
    <Layout>
      <div className="page">
        <h1>Game Logs</h1>
        <main>
          {props.log.map((game) => (
            <div key={game.id} className="game">
              <Game game={game} />
            </div>
          ))}
        </main>
      </div>
      <style jsx>{`
        .game {
          background: white;
          transition: box-shadow 0.1s ease-in;
        }

        .post:hover {
          box-shadow: 1px 1px 3px #aaa;
        }

        .post + .post {
          margin-top: 2rem;
        }
      `}</style>
    </Layout>
  )
}

export default Log
