import { useReducer } from 'react';
import type { ColumnMapping, ParseResult } from '../calculator/parser';
import type {
  Assumptions,
  CalculatedResults,
  EquipmentRow,
  NarrativeSections,
  Project,
} from '../calculator/types';
import { DEFAULT_ASSUMPTIONS } from '../calculator/types';
import {
  SAMPLE_ASSUMPTIONS,
  SAMPLE_EQUIPMENT,
  SAMPLE_PROJECT,
} from '../data/sampleData';

export type Screen = 'landing' | 'import' | 'assumptions' | 'generate' | 'preview';
export type ImportStep = 'paste' | 'mapping' | 'table';
export type NarrativeStatus = 'idle' | 'loading' | 'done' | 'error';

export interface AppState {
  screen: Screen;
  equipment: EquipmentRow[];
  // Import flow
  importStep: ImportStep;
  rawText: string;
  parseResult: ParseResult | null;
  importMapping: ColumnMapping;
  // Project & assumptions
  project: Project;
  assumptions: Assumptions;
  // Results
  calculated: CalculatedResults | null;
  // Narrative
  narrative: NarrativeSections | null;
  narrativeStatus: NarrativeStatus;
  narrativeError: string | null;
}

const BLANK_MAPPING: ColumnMapping = {
  ref: null, description: null, qty: null, kwEach: null, zone: null,
};

const TODAY = new Date().toISOString().split('T')[0];

const initialState: AppState = {
  screen: 'landing',
  equipment: [],
  importStep: 'paste',
  rawText: '',
  parseResult: null,
  importMapping: BLANK_MAPPING,
  project: {
    projectName: '',
    clientName: '',
    consultantName: '',
    organisation: '',
    referenceNumber: '',
    reportStatus: 'Draft',
    date: TODAY,
  },
  assumptions: DEFAULT_ASSUMPTIONS,
  calculated: null,
  narrative: null,
  narrativeStatus: 'idle',
  narrativeError: null,
};

export type AppAction =
  | { type: 'GO_TO'; payload: Screen }
  | { type: 'LOAD_SAMPLE' }
  | { type: 'RESET_IMPORT' }
  | { type: 'SET_RAW_TEXT'; payload: string }
  | { type: 'SET_PARSE_RESULT'; payload: ParseResult }
  | { type: 'SET_IMPORT_STEP'; payload: ImportStep }
  | { type: 'SET_IMPORT_MAPPING'; payload: ColumnMapping }
  | { type: 'SET_EQUIPMENT'; payload: EquipmentRow[] }
  | { type: 'UPDATE_ROW'; payload: { id: string; patch: Partial<EquipmentRow> } }
  | { type: 'ADD_ROW'; payload: EquipmentRow }
  | { type: 'DELETE_ROW'; payload: string }
  | { type: 'UPDATE_PROJECT'; payload: Partial<Project> }
  | { type: 'UPDATE_ASSUMPTIONS'; payload: Partial<Assumptions> }
  | { type: 'SET_CALCULATED'; payload: CalculatedResults }
  | { type: 'SET_NARRATIVE_STATUS'; payload: NarrativeStatus }
  | { type: 'SET_NARRATIVE'; payload: NarrativeSections }
  | { type: 'SET_NARRATIVE_ERROR'; payload: string }
  | { type: 'UPDATE_NARRATIVE_SECTION'; payload: { key: keyof NarrativeSections; value: string } };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'GO_TO':
      return { ...state, screen: action.payload };

    case 'LOAD_SAMPLE':
      return {
        ...state,
        screen: 'assumptions',
        equipment: SAMPLE_EQUIPMENT,
        project: SAMPLE_PROJECT,
        assumptions: SAMPLE_ASSUMPTIONS,
        importStep: 'paste',
        rawText: '',
        parseResult: null,
        importMapping: BLANK_MAPPING,
        calculated: null,
        narrative: null,
        narrativeStatus: 'idle',
        narrativeError: null,
      };

    case 'RESET_IMPORT':
      return {
        ...state,
        importStep: 'paste',
        rawText: '',
        parseResult: null,
        importMapping: BLANK_MAPPING,
        equipment: [],
      };

    case 'SET_RAW_TEXT':
      return { ...state, rawText: action.payload };

    case 'SET_PARSE_RESULT':
      return { ...state, parseResult: action.payload, importMapping: action.payload.mapping };

    case 'SET_IMPORT_STEP':
      return { ...state, importStep: action.payload };

    case 'SET_IMPORT_MAPPING':
      return { ...state, importMapping: action.payload };

    case 'SET_EQUIPMENT':
      return { ...state, equipment: action.payload };

    case 'UPDATE_ROW':
      return {
        ...state,
        equipment: state.equipment.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.patch } : r,
        ),
      };

    case 'ADD_ROW':
      return { ...state, equipment: [...state.equipment, action.payload] };

    case 'DELETE_ROW':
      return { ...state, equipment: state.equipment.filter((r) => r.id !== action.payload) };

    case 'UPDATE_PROJECT':
      return { ...state, project: { ...state.project, ...action.payload } };

    case 'UPDATE_ASSUMPTIONS':
      return { ...state, assumptions: { ...state.assumptions, ...action.payload } };

    case 'SET_CALCULATED':
      return { ...state, calculated: action.payload };

    case 'SET_NARRATIVE_STATUS':
      return { ...state, narrativeStatus: action.payload };

    case 'SET_NARRATIVE':
      return { ...state, narrative: action.payload, narrativeStatus: 'done', narrativeError: null };

    case 'SET_NARRATIVE_ERROR':
      return { ...state, narrativeStatus: 'error', narrativeError: action.payload };

    case 'UPDATE_NARRATIVE_SECTION':
      if (!state.narrative) return state;
      return {
        ...state,
        narrative: { ...state.narrative, [action.payload.key]: action.payload.value },
      };

    default:
      return state;
  }
}

export function useReport() {
  return useReducer(reducer, initialState);
}
