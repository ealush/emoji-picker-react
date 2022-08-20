export async function preloadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  return image;
}
