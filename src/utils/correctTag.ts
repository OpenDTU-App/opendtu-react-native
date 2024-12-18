const correctTag = <T extends string | (string | undefined)>(tag: T): T => {
  if (!tag) {
    return tag;
  }

  const regex = /^v\d+\.\d+\.\d+/;
  const match = tag.match(regex);

  return (match ? match[0] : tag) as T;
};

export default correctTag;
