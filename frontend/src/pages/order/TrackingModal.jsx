import React from "react";

const TrackingModal = ({ trackingEvents, isLoading, error, onClose }) => {
  console.log(trackingEvents);
  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg h-auto max-h-[70vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Tracking History
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto max-h-[55vh]">
          {isLoading && (
            <p className="text-gray-600">Loading tracking data...</p>
          )}

          {error && <p className="text-red-500">{error}</p>}

          {!isLoading && !error && trackingEvents && (
            <div className="space-y-4">
              {trackingEvents.length === 0 ? (
                <p>
                  No tracking events found yet. This is normal if the package
                  hasn't been scanned by FedEx.
                </p>
              ) : (
                trackingEvents.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    {/* Date and Time */}
                    <div className="text-right w-24 flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(event.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Status and Location */}
                    <div className="border-l-2 border-blue-600 pl-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {event.description}
                      </p>
                      {event.exception && (
                        <p className="text-xs text-red-500">
                          {event.exception}
                        </p>
                      )}
                      <p className="text-xs text-gray-600">
                        {event.location.city}, {event.location.state}{" "}
                        {event.location.country}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;
