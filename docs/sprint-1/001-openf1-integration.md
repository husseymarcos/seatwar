# T001 — OpenF1 API integration & data layer

| Field | Value |
|-------|--------|
| **Status** | todo |
| **Priority** | high |
| **PRD** | §3.1, §5.1 (Data: OpenF1 API) |

## Description

Integrate with the [OpenF1 API](https://openf1.org/) to fetch race statistics. Establish a reliable data layer (fetching, error handling, optional caching) so the app can compute who is ahead on the track.

## Acceptance criteria

- [ ] API client or server-side fetchers for OpenF1 endpoints needed for points, race results, qualifying
- [ ] Error handling and (optional) retries for failed requests
- [ ] Types/interfaces for API responses aligned with our use cases
- [ ] Document which OpenF1 endpoints are used and any rate/usage constraints

## Notes

- OpenF1 provides sufficient data for points, race finishes, and qualifying (PRD §7).
- No auth required for OpenF1 in MVP.
