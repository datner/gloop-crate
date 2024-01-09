/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

export interface Image {
  repo: string;
  branch: string;
  tag: string;
  language: string;
  package_manager: string;
  steps: string[];
  copy: string[];
}

export interface App {
  name: string;
  images: Image[];
}

export interface Root {
  apps: App[];
}
