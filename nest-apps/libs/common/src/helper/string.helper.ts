import { ExternalId } from '../types';

export const upperCaseFirstLetter = (string: string) =>
  `${string.slice(0, 1).toUpperCase()}${string.slice(1)}`;

export const lowerCaseAllWordsExceptFirstLetters = (string: string) =>
  string.replaceAll(
    /\S*/g,
    (word) => `${word.slice(0, 1)}${word.slice(1).toLowerCase()}`,
  );

export const getRandomExternalId = (length: number): ExternalId =>
  Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
  ).toString() as ExternalId;
