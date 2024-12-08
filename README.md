# Eadevs Events Practice Project using Tanstak query
## Introduction.
This an app for managing events listing.

It allows CRUD operations on events data utilizing tanstack query for events data server state management by ensuring the data and UI are kept in sync.

We have also leveraged some feature of tanstack to create an intuitive and lively UI by tweeking the CSS and display components conditionally like loading spinners and error messages depending on the state of fetching.

## Tanstack Query
Reacts interacts with the backend to fetch(GET) or modify(POST, PATCH, PUT & DELETE).

The data must be in sync between the frontend at all times. That, any changes on the backend data must reflect on the UI and vice versa.
Tanstack Query allows this to happen seemlessly.

The complexity that comes with ***state management where we have to keep tract of UI state, errors, data and fetching status*** etc.
Traditonally react used component state and side effects to manage this but this approach had so many moving parts and
made the code base enormous and somewhat complex.

Tanstack query library formally known as React query was created to manage serve state(data that is fetched from an external server or API) 

It is helpful in data fetching and state management especially asynchronous data.
It makes fetching, caching, synchronizing and updating server state easy by doing all the heavy lifting ensuring predictability
and efficiency of react applications.

## How to incorporate tanstack in our application.

1. Install tanstack library

    ```
       npm install @tanstack/react-query
    ```

2. Create an instance of QueryClient 

    ```javascript
    export const queryClient = new QueryClient();
    ```

3. Wrapper component with a QueryClientProvider from tanstack at the top level component(App.jsx) to ensure that all components requiring query data can access it. Pass QueryClient instance to it as a prop.

    ```javascript
        import {QueryClientProvider} from "@tanstack/react-query";
        import {queryClient} from "./services/queries.js"; // from step 2


        function App() {

          return (
            <>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router}/>
                </QueryClientProvider>
            </>
          )
        }
    ```

4. Query client configuration

    You can pass an options object to customize the QueryClient(in step 2), like setting cache times or retry behavior though this can be refined in each useQuery() and useMutation() instances. The global settings act as the default for all queries and mutations

    This is particularly useful when a particular query requires different behavior, such as shorter cache times or more frequent retries.

    Examples:

    Global configuration.

      ```javascript
        //  by default, react-query will retry 3 times with a delay of 1000ms between each retry if an error occurs
        //  we can change this behavior by passing the defaultOptions prop to the QueryClientProvider component
        //  Other queries options including refetchOnWindowFocus, enabled, and staleTime can also be set here

        const queryClient = new QueryClient({
                defaultOptions: {
                queries: {
                staleTime: 60000,            // Set queries to be stale after 60 seconds
                cacheTime: 300000,           // Cache time of 5 minutes
                refetchOnWindowFocus: false, // Disable refetching on window focus
                retry: 2,                    // Retry failed queries twice
              },
                mutations: {
                retry: 1,                    // Retry failed mutations once
              },
          },
        });

      ```
      
      Instance configuration per instance, here is a sample query to fetch events used in our app.
      
      ```javascript
          const { data, isPending, isError, error } = useQuery({
            queryKey: ["events"],
            queryFn: fetchEvents(),
            staleTime: 0,
            // gcTime: 30000,
          });
      ```

4. Fetching data using useQuery
   
    TanStack Query uses the `useQuery` method to fetch data from the backend. 
    
    A custom function for fetching data should be passed to the `queryFn` property inside `useQuery`.
    It is important to not that ***useQuery doesn't provide fetching data function out of the box***. This must be configured
    by the developer using native javaScript fetch API or 3rd party library like axios.

    We have utilized useQuery in this app to fetch events listing and detailed events details
    See implementation ```NewEventsSection.jsx``` component inside the ```Events.jsx route``` and also ```EventDetails.jsx```.

    We used native JavaScript Fetch API to fetch data from backend, this was implemented inside a function which was then provide to useQuery as queryFn property as below:

    ```javascript
        import { useQuery } from "@tanstack/react-query";

        // Example component using useQuery with a custom fetch function
        const MyComponent = () => {
          const { data, isLoading, isError, error } = useQuery({
            queryKey: ["events"],
            queryFn: fetchEvents, // A custom function that handles API calls.
            staleTime: 0,
            cacheTime: 30000,     // Optional: caches data for 30 seconds
          });

          if (isLoading) return <p>Loading...</p>;
          if (isError) return <p>Error: {error.message}</p>;

          return <div>{JSON.stringify(data)}</div>;
        };
    ```

    The `useQuery` hook provides essential properties like `data` (fetched data), `isLoading` (loading state), `isError` (error state), `error` (error details), and `refetch` (manual refresh), allowing fine-grained control over query and UI states. 
    
    This setup supports intuitive UI features, such as loading spinners, that respond seamlessly to query status.

    ## Other features of useQuery.
    There are other properties that could be provided to useQuery to control functionality such as when a query should be active,
    we used the property ```enabled``` to ensure search query runs when there is a searchTerm in the search box otherwise the query shouldn't be executed saving unnessary API calls contributing to overall optimization of the application.

    We also passed a signal to cancel query before it is complete if another similar one is triggered in quick succession.


5. Sending/mutating data using useMutation
    Mutations are used to modify backend data. 
    While queries manage data retrieval (e.g., via GET requests), mutations handle creating, updating, or deleting data. This typically involves HTTP methods such as:

    POST: To create new data on the server.
    PUT: To completely replace an existing resource.
    PATCH: To update part of an existing resource.
    DELETE: To remove a resource from the server.

    We use useMutation() function from the tanstack query library and passed in an object with a mutation function and other properties.
    Just like useQuery, useMutation hook provides essential properties like mutate, isPending, isError & error which are used
    to manage the mutation, server status and the UI keeping them in sync

    In this project, we have utilized this in the ```NewEvent page``` to create new events and also in ```EventsDetails Page``` to
    manage event ***updating*** and ***deletion***.
    
    To improve user experience, useMutation() also allows UI optimistic updating by cancelling queries and updating cache with new data before the server is updated. If the mutation succeed, the UI and the server will sync when we invalidate the query. 
    
    In cases where there are errors in the mutations we are able to rollback by configuring the onError() to update cache with previous data we had store in the query Instance context.  
    
    ```EditEvent Page``` implements this optimistic updating.

    ```javascript
        const { mutate } = useMutation({
        mutationFn: updateEvent,
        onMutate: (data) => {
        const newEvent = data.event;
        queryClient.cancelQueries({ queryKey: ["events", params.id] });
        const previousEvent = queryClient.getQueryData(["events", params.id]);
        queryClient.setQueryData(["events", params.id], newEvent);

      return { previousEvent };
      },

      onError: () => {
      queryClient.setQueryData(["events", params.id], content.previousEvent);
      },

      onSettled: () => {
      queryClient.invalidateQueries(["events", params.id]);
      },
    });
    ```