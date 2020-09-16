import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from '../styles/Home.module.css'

const defaultEndpoint = `https://rickandmortyapi.com/api/character/`;

const gridVariants = {
  exit: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const gridMotionProps = {
  initial: 'initial',
  animate: 'enter',
  exit: 'exit',
  variants: gridVariants
}

const postVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: .9
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: .4
    }
  }
};

const postWhileHover = {
  position: 'relative',
  zIndex: 1,
  background: 'white',
  scale: [1, 1.4, 1.2],
  rotate: [0, 10, -10, 0],
  filter: [
    'hue-rotate(0) contrast(100%)',
    'hue-rotate(360deg) contrast(200%)',
    'hue-rotate(45deg) contrast(300%)',
    'hue-rotate(0) contrast(100%)'],
  transition: {
    duration: .2
  }
}

const postMotionProps = {
  initial: 'initial',
  animate: 'enter',
  variants: postVariants,
  whileHover: postWhileHover
}

export async function getServerSideProps() {
  const res = await fetch(defaultEndpoint)
  const data = await res.json();
  return {
    props: {
      data
    }
  }
}

export default function Home({ data }) {
  const { info, results: defaultResults = [] } = data;

  const [page, updatePage] = useState({
    current: defaultEndpoint,
    next: info?.next
  });
  const { current, prev } = page;

  const [results, updateResults] = useState(defaultResults);

  useEffect(() => {
    if ( current === defaultEndpoint ) return;

    async function request() {
      const res = await fetch(current)
      const nextData = await res.json();
      const { info: nextInfo, results: nextResults = [] } = nextData;

      updatePage(prev => {
        return {
          ...prev,
          ...nextInfo
        }
      });

      if ( !nextInfo?.prev ) {
        updateResults(nextResults);
        return;
      }

      updateResults(prev => {
        return [
          ...prev,
          ...nextResults
        ]
      });
    }
    request();
  }, [current])

  function handleLoadMore() {
    updatePage(prev => {
      return {
        ...prev,
        current: page?.next
      }
    });
  }

  function handleOnSubmitSearch(e) {
    e.preventDefault();

    const { currentTarget = {} } = e;
    const fields = Array.from(currentTarget?.elements);
    const fieldQuery = fields.find(field => field.name === 'query');

    const value = fieldQuery.value;

    if ( value ) {
      updatePage({
        current: `https://rickandmortyapi.com/api/character/?name=${value}`
      });
    }
  }

//   console.log('data', data);
  return (
    <div className={styles.container}>
      <Head>
        <title>Rick and Morty Wiki</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <motion.div initial="hidden" animate="visible" variants={{
        hidden: {
            scale: .8,
            opacity: 0
        },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
            delay: .4
            }
        },
        }}>
        <h1 className={styles.title}>
            Wubba Lubba Dub Dub!
        </h1>
        </motion.div>
        <p className={styles.description}>
            Rick and Morty Character Wiki
        </p>
        <form className={styles.search} onSubmit={handleOnSubmitSearch}>
          <input name="query" type="search" />
          <button className={styles.button}>Search</button>
        </form>

        <div className={styles.grid}>
            <ul className={styles.grid}>
            {results.map(result => {
                const { id, name, image } = result;
                return (
                
                    <motion.li key={id} className={styles.card} whileHover={{
                    position: 'relative',
                    zIndex: 1,
                    background: 'white',
                    scale: [1, 1.4, 1.2],
                    rotate: [0, 10, -10, 0],
                    filter: [
                        'hue-rotate(0) contrast(100%)',
                        'hue-rotate(360deg) contrast(200%)',
                        'hue-rotate(45deg) contrast(300%)',
                        'hue-rotate(0) contrast(100%)'
                    ],
                    transition: {
                        duration: .2
                    }
                    }}>
                    <Link href="/character/[id]" as={`/character/${id}`}>
                        <a>
                        <img src={image} alt={`${name} Thumbnail`} />
                        <h3>{ name }</h3>
                        </a>
                    </Link>
                    </motion.li>
                )
            })}
            </ul>
            <p>
              <button className={styles.button} onClick={handleLoadMore}>Load More</button>
            </p>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
