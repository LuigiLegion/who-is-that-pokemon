// Imports
import { useState, useEffect, useCallback } from 'react';

// Initializations
const VOICE_URI_IOS = 'Samantha';
const VOICE_URI_NON_IOS = 'Zira';
const WHO_IS_THAT_POKEMON = "Who's that Pokemon?";
const MAX_NUMBER_OF_POKEMON = 1010;

const synth = window.speechSynthesis;
let voices;

const getVoices = () => {
  voices = synth.getVoices();
};

const getUtteranceVoice = voices =>
  voices.find(voice => voice.voiceURI === VOICE_URI_IOS) ||
  voices.find(voice => voice.voiceURI.includes(VOICE_URI_NON_IOS));

synth.onvoiceschanged = getVoices;
getVoices();
const utteranceVoice = getUtteranceVoice(voices);

const getRandomPokemonNumber = () => Math.floor(Math.random() * MAX_NUMBER_OF_POKEMON) + 1;

const getPokeApiEndpointUrl = () => `https://pokeapi.co/api/v2/pokemon/${getRandomPokemonNumber()}`;

const capitalizeFirstLetter = word => word[0].toUpperCase() + word.slice(1);

// Components
const WhoIsThatPokemon = () => {
  const [mode, setMode] = useState('trainer');
  const [sprite, setSprite] = useState('');
  const [isHidden, setIsHidden] = useState(true);
  const [name, setName] = useState('');
  const [guess, setGuess] = useState('');

  useEffect(() => {
    handleFetch();
    handleReadAloud(WHO_IS_THAT_POKEMON);
  }, []);

  useEffect(() => {
    if (guess && name && guess === name) {
      handleReveal();
    }
  }, [guess, name]);

  const handleMode = event => {
    setMode(event.target.value);
  };

  const handleFetch = () => {
    fetch(getPokeApiEndpointUrl())
      .then(response => response.json())
      .then(data => {
        setSprite(data.sprites.front_default);
        setName(data.name);
      })
      .catch(error => console.error(error.message));
  };

  const handleReadAloud = string => {
    const utterance = new SpeechSynthesisUtterance(string);
    utterance.voice = utteranceVoice;

    synth.speak(utterance);
  };

  const handleReveal = () => {
    setIsHidden(false);
    handleReadAloud(`It's... ${name}!`);
  };

  const handleGenerate = useCallback(() => {
    setGuess('');
    setIsHidden(true);
    handleFetch();
    handleReadAloud(WHO_IS_THAT_POKEMON);
  }, []);

  const handleGuess = event => {
    setGuess(event.target.value.toLowerCase());
  };

  return (
    <div>
      <form>
        <fieldset>
          <legend>Please select your preferred game mode</legend>

          <div>
            <input
              type="radio"
              id="trainerMode"
              name="mode"
              value="trainer"
              checked={mode === 'trainer'}
              onChange={handleMode}
            />

            <label htmlFor="trainerMode">Trainer</label>

            <input
              type="radio"
              id="masterMode"
              name="mode"
              value="master"
              checked={mode === 'master'}
              onChange={handleMode}
            />

            <label htmlFor="masterMode">Master</label>
          </div>
        </fieldset>
      </form>

      <h1>Who's that Pokemon?</h1>

      <div>
        <img
          className={isHidden ? 'sprite silhouette' : 'sprite'}
          src={sprite}
          alt={name}
          onClick={handleReveal}
        />
      </div>

      <button onClick={handleReveal}>REVEAL</button>

      <button onClick={handleGenerate}>GENERATE</button>

      {mode === 'master' &&
        <form>
          <div>
            <input
              type="text"
              id="guess"
              name="guess"
              value={guess}
              disabled={guess === name}
              onChange={handleGuess}
            ></input>
          </div>
        </form>
      }

      {!isHidden && name && <h2>It's... {capitalizeFirstLetter(name)}!</h2>}
    </div>
  );
};

// Exports
export default WhoIsThatPokemon;
