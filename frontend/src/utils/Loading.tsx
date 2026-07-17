const LoadingUI = ({ loadingContent }: { loadingContent: string }) => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="rounded-3xl border border-gray-100 bg-white px-10 py-8 text-center shadow-md">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-100 border-t-[#e23744]" />
        <p className="font-medium text-gray-600">{loadingContent}</p>
      </div>
    </div>
  );
};

export default LoadingUI;
