import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../src/pages/produto/Landing.jsx';

export function render() {
  return renderToStaticMarkup(<MemoryRouter initialEntries={['/']}><Landing /></MemoryRouter>);
}
