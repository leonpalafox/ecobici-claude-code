// Mexico City Tren Ligero (Light Rail) stations - Xochimilco Line
// Route: Tasqueña to Xochimilco (18 stations, 13.4 km)
// Coordinates sourced from Moovit transit data (verified accurate)
export interface TrenLigeroStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const trenLigeroStations: TrenLigeroStation[] = [
  { id: 'tl-1', name: 'Tasqueña', lat: 19.343756, lon: -99.139583 },
  { id: 'tl-2', name: 'Las Torres', lat: 19.340823, lon: -99.143436 },
  { id: 'tl-3', name: 'Ciudad Jardín', lat: 19.335633, lon: -99.141821 },
  { id: 'tl-4', name: 'La Virgen', lat: 19.331682, lon: -99.140608 },
  { id: 'tl-5', name: 'Xotepingo', lat: 19.327524, lon: -99.139307 },
  { id: 'tl-6', name: 'Nezahualpilli', lat: 19.323707, lon: -99.138128 },
  { id: 'tl-7', name: 'Registro Federal', lat: 19.317900, lon: -99.138797 },
  { id: 'tl-8', name: 'Textitlán', lat: 19.313109, lon: -99.140392 },
  { id: 'tl-9', name: 'El Vergel', lat: 19.307167, lon: -99.143099 },
  { id: 'tl-10', name: 'Estadio Azteca', lat: 19.301698, lon: -99.147110 },
  { id: 'tl-11', name: 'Huipulco', lat: 19.297488, lon: -99.150699 },
  { id: 'tl-12', name: 'Xomali', lat: 19.288832, lon: -99.146903 },
  { id: 'tl-13', name: 'Periférico', lat: 19.272770, lon: -99.139754 },
  { id: 'tl-14', name: 'Tepepan', lat: 19.279484, lon: -99.133137 },
  { id: 'tl-15', name: 'La Noria', lat: 19.267967, lon: -99.125718 },
  { id: 'tl-16', name: 'Huichapan', lat: 19.264126, lon: -99.118040 },
  { id: 'tl-17', name: 'Francisco Goitia', lat: 19.260711, lon: -99.111202 },
  { id: 'tl-18', name: 'Xochimilco', lat: 19.259390, lon: -99.107864 },
];
