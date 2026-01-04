// Mexico City Tren Ligero (Light Rail) stations - Xochimilco Line
// Route: Tasqueña to Xochimilco (18 stations, 13.4 km)
// Coordinates estimated based on known route through Coyoacán, Tlalpan, and Xochimilco boroughs
export interface TrenLigeroStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const trenLigeroStations: TrenLigeroStation[] = [
  { id: 'tl-1', name: 'Tasqueña', lat: 19.344168, lon: -99.142685 },
  { id: 'tl-2', name: 'Las Torres', lat: 19.338500, lon: -99.139500 },
  { id: 'tl-3', name: 'Ciudad Jardín', lat: 19.333200, lon: -99.136200 },
  { id: 'tl-4', name: 'La Virgen', lat: 19.328000, lon: -99.133000 },
  { id: 'tl-5', name: 'Xotepingo', lat: 19.322800, lon: -99.129800 },
  { id: 'tl-6', name: 'Nezahualpilli', lat: 19.317600, lon: -99.126600 },
  { id: 'tl-7', name: 'Registro Federal', lat: 19.312400, lon: -99.123400 },
  { id: 'tl-8', name: 'Textitlán', lat: 19.307200, lon: -99.120200 },
  { id: 'tl-9', name: 'El Vergel', lat: 19.302000, lon: -99.117000 },
  { id: 'tl-10', name: 'Estadio Azteca', lat: 19.296800, lon: -99.113800 },
  { id: 'tl-11', name: 'Huipulco', lat: 19.291600, lon: -99.110600 },
  { id: 'tl-12', name: 'Xomali', lat: 19.286400, lon: -99.107400 },
  { id: 'tl-13', name: 'Periférico', lat: 19.281200, lon: -99.104200 },
  { id: 'tl-14', name: 'Tepepan', lat: 19.276000, lon: -99.101000 },
  { id: 'tl-15', name: 'La Noria', lat: 19.270800, lon: -99.097800 },
  { id: 'tl-16', name: 'Huichapan', lat: 19.265600, lon: -99.094600 },
  { id: 'tl-17', name: 'Francisco Goitia', lat: 19.260400, lon: -99.091400 },
  { id: 'tl-18', name: 'Xochimilco', lat: 19.255200, lon: -99.103500 },
];
