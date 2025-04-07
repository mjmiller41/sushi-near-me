---
layout: page
title: Slugify Test
permalink: /slugify-test
js_names:
js_name_slugs:
---
{% assign test_count = 0 %}
{% assign fail_count = 0 %}

|Name|JS Slug|Liquid Slug|
|:--:|:-----:|:---------:|
{% for name in page.js_names %}
  {%- assign test_count = test_count | plus: 1 -%}
  {%- assign liquid_name_slug = name | slugify: "latin" -%}
  {%- assign js_name_slug = page.js_name_slugs[forloop.index0] -%}
  {%- if liquid_name_slug != js_name_slug -%}
    {%- assign fail_count = fail_count | plus: 1 -%}
|{{name}}|{{js_name_slug}}|{{liquid_name_slug}}|
  {% endif -%}
{%- endfor %}

## Results

- Number of tests: {{ test_count }}
- Number of tests failed: {{ fail_count }}
