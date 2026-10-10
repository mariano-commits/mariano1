import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluarPorReglas } from "./reglas";

test("bloquea política aunque tenga acentos o mayúsculas", () => {
  const r = evaluarPorReglas("El PRESIDENTE inauguró un estadio");
  assert.equal(r.bloqueada, true);
  assert.equal(r.tema, "politica");
  assert.equal(evaluarPorReglas("Se adelantan las elecciones").bloqueada, true);
});

test("bloquea guerra y conflictos armados", () => {
  assert.equal(evaluarPorReglas("Nuevo bombardeo en la frontera").tema, "guerra");
  assert.equal(evaluarPorReglas("Movimiento de tropas cerca del río").tema, "guerra");
});

test("deja pasar deportes, ciencia y cocina", () => {
  for (const texto of [
    "River ganó el partido 2 a 1 con un gol de cabeza",
    "Descubren una nueva especie de rana en la selva",
    "Cinco recetas fáciles con calabaza para el otoño",
    "La NASA publica imágenes inéditas de Júpiter",
  ]) {
    assert.equal(evaluarPorReglas(texto).bloqueada, false, texto);
  }
});

test("solo matchea al inicio de palabra", () => {
  // "guerrero" contiene "guerr" pero el patrón es "guerra"; "temporada" no es "otan".
  assert.equal(evaluarPorReglas("Un guerrero ninja en la nueva película animada").bloqueada, false);
  assert.equal(evaluarPorReglas("Arranca la temporada de verano").bloqueada, false);
});
