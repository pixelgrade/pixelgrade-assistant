# First-Party Service Registry Design

## Purpose

Pixelgrade Assistant, Style Manager, Pixelgrade Cloud, pixelgrade.com, and the
starter sources already exchange requests required to deliver configuration,
documentation, design assets, starters, layouts, and pages. Those functional
requests should explicitly identify the requesting WordPress installation so
Pixelgrade can retain a reliable site registry without a separate analytics
beacon or opt-in prompt.

The registry describes observed service requests. It must not turn those
requests into claims about clicks, completed imports, reading behavior, or
other actions the server cannot actually observe.

## Data Contract

Every participating request uses the existing Cloud-compatible envelope:

```php
array(
	'site_url'     => 'https://example.com/',
	'service'      => 'remote_config_requested',
	'theme_data'   => array(
		'slug'     => 'anima',
		'name'     => 'Anima',
		'version'  => '1.2.3',
		'wupdates' => array( 'id' => '...', 'type' => 'theme_wporg' ),
	),
	'site_data'    => array(
		'url'                  => 'https://example.com/',
		'is_ssl'               => true,
		'environment_type'     => 'production',
		'wp'                   => array(
			'version'  => '6.9',
			'language' => 'en-US',
			'rtl'      => false,
		),
		'pixelgrade_assistant' => array( 'version' => '2.0.0' ),
		'style_manager'        => array( 'version' => '2.1.0' ),
	),
	'customer_data' => array( 'id' => 123 ),
);
```

The customer ID is present only when the site is already connected. OAuth
credentials, license hashes, email addresses, user names, content, IP
addresses, admin URLs, and support details are outside this contract.

## Flow

Assistant owns a small context builder and merges it into the remote config and
documentation requests. Style Manager continues using the same envelope for
Cloud design-asset requests, now naming the observed service. Starter sources
read the same fields from their existing requests. pixelgrade.com and starter
sources relay only the allowlisted envelope to the existing Cloud stats
endpoint after serving the functional request; the browser/plugin does not send
a second analytics event.

Cloud normalizes the URL and upserts one site row. It retains first seen, last
seen, the most recent service, versions, theme, locale, environment, connected
customer ID, and a lifetime request count. A separate daily table aggregates
counts per site and service. It does not retain one row per request.

## Reporting and Failure Behavior

The Cloud Sites table exposes URL, most recent observed service, environment,
stack versions, request count, first seen, and last seen. The Stats tab exposes
total, new, active, and returning sites plus service observations for a selected
recent window.

Registry writes and relays are best-effort. A failure must never block config,
docs, starter, layout, page, or design-asset delivery. Unknown service names are
sanitized and bounded. Requests without a valid HTTP(S) site URL are served but
not relayed or stored.

## Privacy Boundary

The canonical URL is intentionally retained as site-identifying operational
data; it is not described as anonymous. The implementation reuses functional
traffic, stores daily aggregates instead of an event log, avoids IP/content/user
identity collection, keeps access behind the existing Cloud admin capability,
and preserves the existing per-site deletion path.
