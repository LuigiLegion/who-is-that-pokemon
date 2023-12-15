// Imports
import { useState, useEffect, useCallback } from 'react';

// Initializations
const VOICE_URI_IOS = 'Samantha';
const VOICE_URI_NON_IOS = 'Zira';
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

const getRandomPokemonNumber = () => Math.floor(Math.random() * MAX_NUMBER_OF_POKEMON);

const getPokeApiEndpointUrl = () => `https://pokeapi.co/api/v2/pokemon/${getRandomPokemonNumber()}`;

const capitalizeFirstLetter = word => word[0].toUpperCase() + word.slice(1);

// Components
const WhoIsThatPokemon = () => {
  const [sprite, setSprite] = useState('');
  const [name, setName] = useState('');
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    handleFetch();
    handleReadAloud("Who's that Pokemon?");
  }, []);

  const handleFetch = () => {
    fetch(getPokeApiEndpointUrl())
      .then(response => response.json())
      .then(data => {
        setSprite(data.sprites.front_default);
        setName(capitalizeFirstLetter(data.name));
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
    setIsHidden(true);
    handleFetch();
    handleReadAloud("Who's that Pokemon?");
  }, []);

  return (
    <div>
      <h1>Who's that Pokemon?</h1>

      <div>
        <img
          className={isHidden ? 'silhouette' : ''}
          src={sprite}
          alt={name}
          onClick={handleReveal}
        />

        {!isHidden && <h2>It's... {name}!</h2>}
      </div>

      <button onClick={handleGenerate}>GENERATE</button>
    </div>
  );
};

// Exports
export default WhoIsThatPokemon;
