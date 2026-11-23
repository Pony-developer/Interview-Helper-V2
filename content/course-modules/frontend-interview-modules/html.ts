import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 7–21 of the list: HTML. */
export const htmlQuiz: SlideDef = {
  kind: "quiz",
  slug: "html-quiz",
  title: { en: "HTML basics", uk: "Основи HTML" },
  questions: [
    question(
      "doctype",
      ["What does `<!DOCTYPE html>` do?", "Що робить `<!DOCTYPE html>`?"],
      [
        ["Imports the HTML library", "Підключає бібліотеку HTML"],
        [
          "Tells the browser to render the page in standards mode by the HTML5 rules, not in quirks mode",
          "Каже браузеру рендерити сторінку в стандартному режимі за правилами HTML5, а не в режимі сумісності (quirks mode)",
        ],
        ["Declares the language of the page", "Оголошує мову сторінки"],
        ["It is an HTML comment and does nothing", "Це HTML-коментар, який нічого не робить"],
      ],
      "b",
    ),
    question(
      "page-structure",
      ["Which set of tags forms the basic structure of an HTML page?", "Який набір тегів утворює базову структуру HTML-сторінки?"],
      [
        ["`<page>`, `<top>`, `<content>`", "`<page>`, `<top>`, `<content>`"],
        ["`<div>`, `<span>`, `<p>`", "`<div>`, `<span>`, `<p>`"],
        ["`<header>`, `<style>`, `<script>`", "`<header>`, `<style>`, `<script>`"],
        ["`<html>`, `<head>` (with `<meta>` and `<title>`), `<body>`", "`<html>`, `<head>` (з `<meta>` і `<title>`), `<body>`"],
      ],
      "d",
    ),
    question(
      "semantic-tags",
      ["Which of these tags are semantic, that is, they say what their content means?", "Які з цих тегів семантичні, тобто кажуть, що означає їхній вміст?"],
      [
        ["`<article>`", "`<article>`"],
        ["`<div>`", "`<div>`"],
        ["`<nav>`", "`<nav>`"],
        ["`<main>`", "`<main>`"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "br-tag",
      ["What is true about `<br>`?", "Що правильно про `<br>`?"],
      [
        ["It must always be closed as `<br></br>`", "Його завжди треба закривати як `<br></br>`"],
        ["It is the right way to add space between paragraphs", "Це правильний спосіб додати відступ між абзацами"],
        [
          "It is a void element for a line break inside text (addresses, poems), not a tool for vertical spacing",
          "Це порожній елемент для розриву рядка всередині тексту (адреси, вірші), а не інструмент для вертикальних відступів",
        ],
        ["It was removed in HTML5", "Його прибрали в HTML5"],
      ],
      "c",
    ),
    question(
      "new-tags",
      ["Which of these were added to HTML relatively recently and work in modern browsers?", "Що з цього додали в HTML відносно нещодавно і що працює в сучасних браузерах?"],
      [
        ["`<dialog>`, a native modal or non-modal dialog", "`<dialog>`, нативне модальне або немодальне вікно"],
        ["`<search>`, a landmark for a search area", "`<search>`, орієнтир для області пошуку"],
        ["`<marquee>`, a scrolling text line", "`<marquee>`, рядок тексту, що біжить"],
        ["The `popover` attribute for popups without JS", "Атрибут `popover` для спливних елементів без JS"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "div-span",
      ["What is the difference between `<div>` and `<span>`?", "Яка різниця між `<div>` і `<span>`?"],
      [
        ["`<span>` is semantic, `<div>` is not", "`<span>` семантичний, а `<div>` ні"],
        [
          "`<div>` is a block container, `<span>` is an inline one; neither has any meaning of its own",
          "`<div>` — блоковий контейнер, `<span>` — рядковий; жоден не має власного змісту",
        ],
        ["`<div>` can only hold text", "`<div>` може містити лише текст"],
        ["There is no difference", "Різниці немає"],
      ],
      "b",
    ),
    question(
      "data-attributes",
      ["How do you read the value of `<button data-user-id=\"42\">` in JavaScript?", "Як прочитати значення `<button data-user-id=\"42\">` у JavaScript?"],
      [
        ["`button.dataset.userId`", "`button.dataset.userId`"],
        ["`button.data.user-id`", "`button.data.user-id`"],
        ["`button.userId`", "`button.userId`"],
        ["`button.getData('user-id')`", "`button.getData('user-id')`"],
      ],
      "a",
    ),
    question(
      "class-id",
      ["What is the difference between `class` and `id`?", "Яка різниця між `class` та `id`?"],
      [
        ["`class` is only for JS, `id` is only for CSS", "`class` лише для JS, а `id` лише для CSS"],
        ["An element can have several ids", "Елемент може мати кілька id"],
        ["There is no difference", "Різниці немає"],
        [
          "An `id` must be unique on the page and has higher specificity; one class can be used on many elements, and an element can have several classes",
          "`id` має бути унікальним на сторінці й має вищу специфічність; один клас можна використати на багатьох елементах, а елемент може мати кілька класів",
        ],
      ],
      "d",
    ),
    question(
      "links",
      ["Which statements about hyperlinks are true?", "Які твердження про гіперпосилання правильні?"],
      [
        [
          "An internal link points within the same site or page, for example `href=\"#contacts\"` or `href=\"/about\"`",
          "Внутрішнє посилання веде в межах того самого сайту чи сторінки, наприклад `href=\"#contacts\"` або `href=\"/about\"`",
        ],
        [
          "An external link opened in a new tab uses `target=\"_blank\"`, usually with `rel=\"noopener noreferrer\"`",
          "Зовнішнє посилання, що відкривається в новій вкладці, має `target=\"_blank\"`, зазвичай із `rel=\"noopener noreferrer\"`",
        ],
        ["A link works fine without `href`", "Посилання добре працює й без `href`"],
        ["The `download` attribute makes the browser download the file instead of opening it", "Атрибут `download` змушує браузер завантажити файл, а не відкрити його"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "svg",
      [
        "Which way of adding SVG lets you style its inner parts (for example the `fill` of a `path`) with the page's CSS?",
        "Який спосіб додавання SVG дає змогу стилізувати його внутрішні частини (наприклад, `fill` у `path`) CSS-ом сторінки?",
      ],
      [
        ["`<img src=\"icon.svg\">`", "`<img src=\"icon.svg\">`"],
        ["CSS `background-image: url(icon.svg)`", "CSS `background-image: url(icon.svg)`"],
        ["Inline `<svg>` right in the HTML", "Inline `<svg>` прямо в HTML"],
        ["None of them", "Жоден"],
      ],
      "c",
    ),
    question(
      "form-validation",
      ["Which built-in HTML features validate a form without JS?", "Які вбудовані можливості HTML валідують форму без JS?"],
      [
        ["The `required` attribute", "Атрибут `required`"],
        ["`type=\"email\"`, `type=\"url\"`, `type=\"number\"`", "`type=\"email\"`, `type=\"url\"`, `type=\"number\"`"],
        ["`pattern`, `minlength`, `min` and `max`", "`pattern`, `minlength`, `min` і `max`"],
        ["`class=\"validate\"`", "`class=\"validate\"`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "lists",
      ["Which description of HTML lists is correct?", "Який опис списків у HTML правильний?"],
      [
        ["`<ul>` is numbered, `<ol>` is bulleted, `<dl>` is a dropdown", "`<ul>` нумерований, `<ol>` маркований, `<dl>` випадний"],
        [
          "`<ul>` is unordered, `<ol>` is ordered, `<dl>` is a description list of `<dt>` terms and `<dd>` descriptions",
          "`<ul>` невпорядкований, `<ol>` впорядкований, `<dl>` — список описів із термінів `<dt>` та описів `<dd>`",
        ],
        ["`<ul>`, `<ol>` and `<dl>` all contain only `<li>`", "`<ul>`, `<ol>` і `<dl>` містять лише `<li>`"],
        ["`<dl>` is a deprecated tag", "`<dl>` — застарілий тег"],
      ],
      "b",
    ),
    question(
      "iframe",
      ["What is an `<iframe>` used for?", "Для чого використовують `<iframe>`?"],
      [
        ["To include a CSS file", "Щоб підключити CSS-файл"],
        ["To make an image responsive", "Щоб зробити зображення адаптивним"],
        ["To embed another HTML document in the page: maps, videos, widgets", "Щоб вбудувати в сторінку інший HTML-документ: карти, відео, віджети"],
        ["To create a frame-by-frame animation", "Щоб створити покадрову анімацію"],
      ],
      "c",
    ),
    question(
      "form-methods",
      ["What is the difference between `method=\"get\"` and `method=\"post\"` on a form?", "Яка різниця між `method=\"get\"` і `method=\"post\"` у формі?"],
      [
        ["GET is encrypted, POST is not", "GET шифрується, а POST ні"],
        [
          "GET puts the data into the URL query string (it can be bookmarked, is limited in length and is not for secrets); POST sends it in the request body",
          "GET кладе дані в рядок запиту URL (його можна зберегти в закладках, він обмежений за довжиною і не для секретів); POST передає їх у тілі запиту",
        ],
        ["POST can only send files", "POST може надсилати лише файли"],
        ["There is no difference", "Різниці немає"],
      ],
      "b",
    ),
    question(
      "block-inline",
      ["How does a block element differ from an inline one?", "Чим блоковий елемент відрізняється від рядкового?"],
      [
        [
          "A block element starts on a new line and takes the full available width, and its width and height apply; an inline element flows with the text, and its width, height and vertical margins are ignored",
          "Блоковий починається з нового рядка й займає всю доступну ширину, його ширина й висота застосовуються; рядковий тече разом із текстом, а його ширина, висота й вертикальні margin ігноруються",
        ],
        ["It is the other way around", "Навпаки"],
        ["They only differ in color", "Вони відрізняються лише кольором"],
        ["Inline elements cannot contain text", "Рядкові елементи не можуть містити текст"],
      ],
      "a",
    ),
  ],
};
