// Imports
import { useState, useEffect, useCallback } from 'react';
import pokemonNumberRangesByGen from '../../data/pokemon-number-ranges-by-gen.json';

// Initializations
const VOICE_URI_IOS = 'Samantha';
const VOICE_URI_NON_IOS = 'Zira';
const WHO_IS_THAT_POKEMON = "Who's that Pokemon?";

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

const getRandomPokemonNumber = ({ min, max }) => Math.floor(Math.random() * (max - min) + min);

const getPokeApiEndpointUrl = gen => `https://pokeapi.co/api/v2/pokemon/${getRandomPokemonNumber(pokemonNumberRangesByGen[gen])}`;

const capitalizeFirstLetter = word => word[0].toUpperCase() + word.slice(1);

// Components
const WhoIsThatPokemon = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [mode, setMode] = useState('trainer');
  const [gen, setGen] = useState('I-IX');
  const [sprite, setSprite] = useState('');
  const [isHidden, setIsHidden] = useState(true);
  const [name, setName] = useState('');
  const [guess, setGuess] = useState('');

  useEffect(() => {
    handleFetch(gen);
    handleReadAloud(WHO_IS_THAT_POKEMON, isMuted);
  }, []);

  useEffect(() => {
    if (guess && name && guess === name) {
      handleReveal();
    }
  }, [guess, name]);

  const handleIsMuted = event => {
    setIsMuted(event.target.value === 'true');
  };

  const handleMode = event => {
    setMode(event.target.value);
  };

  const handleGen = event => {
    setGen(event.target.value);
  };

  const handleFetch = gen => {
    fetch(getPokeApiEndpointUrl(gen))
      .then(response => response.json())
      .then(data => {
        setSprite(data.sprites.front_default);
        setName(data.name);
      })
      .catch(error => console.error(error.message));
  };

  const handleReadAloud = (text, isMuted) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = utteranceVoice;

    if (!isMuted) {
      synth.speak(utterance);
    }
  };

  const handleReveal = () => {
    setIsHidden(false);
    handleReadAloud(`It's... ${name}!`, isMuted);
  };

  const handleGenerate = useCallback((gen, isMuted) => {
    setGuess('');
    setIsHidden(true);
    handleFetch(gen);
    handleReadAloud(WHO_IS_THAT_POKEMON, isMuted);
  }, []);

  const handleGuess = event => {
    setGuess(event.target.value.toLowerCase());
  };

  return (
    <div>
      <form>
        <fieldset>
          <legend>AUDIO</legend>

          <div>
            <input
              type="radio"
              id="on"
              name="isMuted"
              value="false"
              checked={!isMuted}
              onChange={handleIsMuted}
            />

            <label htmlFor="on">On</label>

            <input
              type="radio"
              id="off"
              name="isMuted"
              value="true"
              checked={isMuted}
              onChange={handleIsMuted}
            />

            <label htmlFor="off">Off</label>
          </div>
        </fieldset>

        <fieldset>
          <legend>MODE</legend>

          <div>
            <input
              type="radio"
              id="trainer"
              name="mode"
              value="trainer"
              checked={mode === 'trainer'}
              onChange={handleMode}
            />

            <label htmlFor="trainer">Trainer</label>

            <input
              type="radio"
              id="master"
              name="mode"
              value="master"
              checked={mode === 'master'}
              onChange={handleMode}
            />

            <label htmlFor="master">Master</label>
          </div>
        </fieldset>

        <fieldset>
          <legend>GENERATION</legend>

          <div>
            <select
              id="gen"
              onChange={handleGen}
            >
              <option value="I-IX">Gens I-IX</option>
              <option value="I-VIII">Gens I-VIII</option>
              <option value="I-VII">Gens I-VII</option>
              <option value="I-VI">Gens I-VI</option>
              <option value="I-V">Gens I-V</option>
              <option value="I-IV">Gens I-IV</option>
              <option value="I-III">Gens I-III</option>
              <option value="I-II">Gens I-II</option>
              <option value="I">Gen I</option>
              <option value="II">Gen II</option>
              <option value="III">Gen III</option>
              <option value="IV">Gen IV</option>
              <option value="V">Gen V</option>
              <option value="VI">Gen VI</option>
              <option value="VII">Gen VII</option>
              <option value="VIII">Gen VIII</option>
              <option value="IX">Gen IX</option>
            </select>
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

      <button onClick={() => handleGenerate(gen, isMuted)}>GENERATE</button>

      {mode === 'master' &&
        <form>
          <fieldset>
            <legend>Guess the Pokemon</legend>

            <div>
              <input
                type="text"
                id="guess"
                name="guess"
                value={guess}
                disabled={!isHidden || guess === name}
                onChange={handleGuess}
              ></input>
            </div>
          </fieldset>
        </form>
      }

      {!isHidden && name && <h2>It's... {capitalizeFirstLetter(name)}!</h2>}
    </div>
  );
};

// Exports
export default WhoIsThatPokemon;
