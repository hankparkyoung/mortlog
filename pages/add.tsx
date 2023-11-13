import React, { useState } from 'react';
import Layout from '../components/Layout';
import Router from 'next/router';

const Log: React.FC = () => {
  const [headliner, setHeadliner] = useState('');
  const [notes, setNotes] = useState('');

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    //Todo: match the body to actually match game data
    try {
      const body = { headliner, notes };
      await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await Router.push('/logs');
    } catch (error) {
      console.error(error);
    }
  };

  //Todo: change first input to a double dropdown (unit, trait)

  return (
    <Layout>
      <div>
        <form onSubmit={submitData}>
          <h1>New Log</h1>
          <input
            autoFocus
            onChange={(e) => setHeadliner(e.target.value)}
            placeholder="Headliner"
            type="text"
            value={headliner}
          />
          <textarea
            cols={50}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            rows={8}
            value={notes}
          />
          <input disabled={!notes || !headliner} type="submit" value="Create" />
          <a className="back" href="#" onClick={() => Router.push('/')}>
            or Cancel
          </a>
        </form>
      </div>
      <style jsx>{`
        .page {
          background: var(--geist-background);
          padding: 3rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        input[type='text'],
        textarea {
          width: 100%;
          padding: 0.5rem;
          margin: 0.5rem 0;
          border-radius: 0.25rem;
          border: 0.125rem solid rgba(0, 0, 0, 0.2);
        }

        input[type='submit'] {
          background: #ececec;
          border: 0;
          padding: 1rem 2rem;
        }

        .back {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  );
};

export default Log;
