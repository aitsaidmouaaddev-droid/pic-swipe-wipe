import { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { StylesOverride, ThemeTokens } from "@themes/theme";

/**
 * Signature d'une factory de styles "thémée".
 *
 * Convention recommandée :
 * - Chaque composant UI exporte une fonction `makeXStyles(theme)` qui retourne un objet de styles,
 *   généralement construit via `StyleSheet.create({ ... })`.
 *
 * @template S - Objet de styles retourné par makeStyles (ex: { container, trigger, label, ... }).
 */
type MakeStylesFn<S> = (theme: ThemeTokens) => S;

/**
 * @function useResultedStyle
 * @description
 * Construit un objet de styles "résultants" à partir :
 * 1) des styles de base générés par `makeStyles(theme)`
 * 2) d'un override optionnel (patch) fourni par le parent
 *
 * ✅ Particularité importante : "patch" et non "replace"
 * - On ne fait PAS un merge profond d'objets (incompatible avec StyleSheet.create qui renvoie souvent des IDs numériques).
 * - On COMPOSE les styles au niveau de chaque clé via `StyleSheet.compose(base[key], override[key])`.
 *
 * Concrètement :
 * - `styles.container` devient : base.container + override.container
 * - donc tu peux override uniquement `{ width: "100%" }` sans devoir redéfinir tous les champs du style container.
 *
 * Pourquoi `StyleSheet.compose` ?
 * - RN autorise les styles sous forme d'ID (StyleSheet.create -> number), d'objet, ou d'array.
 * - Le deep merge est fragile (base peut être un number).
 * - `StyleSheet.compose(a, b)` est la méthode officielle pour empiler 2 styles (b override a).
 *
 * ⚠️ Merge shallow au niveau des clés
 * - L’override est appliqué clé par clé, pas à l’intérieur de la structure de l’objet retourné par makeStyles.
 * - Exemple : override.trigger ne remplace pas base.trigger, il est composé dessus.
 *
 * @template S
 * @param theme - Thème courant (tokens) utilisé pour générer les styles de base.
 * @param makeStyles - Factory de styles (ex: `makeSelectStyles`) construite à partir du thème.
 * @param override - Patch optionnel : un objet qui peut contenir quelques clés (ex: { trigger: {...} }).
 *
 * @returns Un objet de styles de même shape que `makeStyles`, avec composition appliquée pour chaque clé overridée.
 *
 * @example
 * // select.style.ts
 * export const makeSelectStyles = (theme: ThemeTokens) => StyleSheet.create({ ... });
 * export type SelectStyles = ReturnType<typeof makeSelectStyles>;
 *
 * // Select.tsx
 * type SelectStylesOverride = StylesOverride<SelectStyles>;
 *
 * const styles = useResultedStyle(theme, makeSelectStyles, stylesOverride);
 *
 * // Parent usage (patch partiel)
 * const filterStyle: SelectStylesOverride = {
 *   container: { width: "100%" },
 *   trigger: { borderRadius: 14 },
 * };
 *
 * <Select stylesOverride={filterStyle} ... />
 *
 * @notes
 * - Si ton composant a des styles dynamiques (ex: menu position/width), garde-les en dernier :
 *   `style={[styles.menu, dynamicMenuStyle]}`
 *   => ça évite de casser des tests ou la logique de layout.
 */
function useResultedStyle<S extends Record<string, any>>(
  theme: ThemeTokens,
  makeStyles: MakeStylesFn<S>,
  override?: StylesOverride<S>,
): Record<keyof S, any> {
  return useMemo(() => {
    // 1) Styles de base calculés depuis le thème
    const base = makeStyles(theme);

    // 2) Pas d'override => on retourne les styles tels quels
    if (!override) return base as any;

    // 3) Copie shallow pour conserver la shape de base
    const composed: any = { ...base };

    // 4) Composition clé par clé : base[key] + override[key]
    //    (override prend le dessus si conflit)
    (Object.keys(override) as (keyof S)[]).forEach((key) => {
      composed[key] = StyleSheet.compose((base as any)[key], override[key]);
      // Alternative équivalente (moins "officielle") :
      // composed[key] = [(base as any)[key], override[key]];
    });

    return composed;
  }, [theme, makeStyles, override]);
}

export default useResultedStyle;
